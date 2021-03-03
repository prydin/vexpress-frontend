pipeline {
    agent any

    parameters {
        string(defaultValue: getDefaultServiceUrl('zipcode'), description: 'The Zipcode Service URL', name: 'ZIPCODE_URL', trim: true)
        string(defaultValue: getDefaultServiceUrl("pricing"), description: 'The Pricing Service URL', name: 'PRICING_URL', trim: true)
        string(defaultValue: getDefaultServiceUrl('orders'), description: 'The Orders Service URL', name: 'ORDERS_URL', trim: true)
        string(defaultValue: getDefaultServiceUrl('scheduling'), description: 'The Scheduling Service URL', name: 'SCHEDULING_URL', trim: true)
    }

    stages {
        stage('Init') {
            steps {
                script {
                    def gradle = readFile(file: 'build.gradle')
                    env.version = (gradle =~ /version\s*=\s*["'](.+)["']/)[0][1]
                    echo "Inferred version: ${env.version}"
                }
            }
        }

        stage('Build') {
            steps {
                sh 'cd src/main/webapp; npm install; cd ../../..; ./gradlew clean assemble'
            }
        }

        stage('Test') {
            steps {
                sh './gradlew test'
                junit 'build/test-results/test/*.xml'
            }
        }

        stage('Publish') {
            steps {
                archiveArtifacts(artifacts: "build/libs/vexpress-frontend-${env.version}.jar", fingerprint: true, onlyIfSuccessful: true)
            }
        }

        stage("InitDeployment") {
            steps {
                withCredentials([usernamePassword(credentialsId: 'apiToken', passwordVariable: 'PASSWORD', usernameVariable: 'USER')]) {
                    script {
                        env.apiUser = USER
                        env.apiToken = PASSWORD
                    }
                }
            }
        }

        stage('DeployVMs') {
            steps {

                withCredentials([usernamePassword(credentialsId: 'sshCreds', passwordVariable: 'PASSWORD', usernameVariable: 'USER')]) {
                    script {
                        def depId = vraDeployFromCatalog(
                                configFormat: "yaml",
                                config: readFile('infra/appserver.yaml'))[0].id
                        vraWaitForAddress(
                                deploymentId: depId,
                                resourceName: 'JavaServer')[0]
                        env.appIps = getInternalAddresses(depId, "JavaServer").join(',')
                        echo "Deployed: ${depId} address: ${env.appIps}"
                    }
                }
            }
        }

        stage('Configure') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'sshCreds', passwordVariable: 'PASSWORD', usernameVariable: 'USER')]) {
                    script {
                        def txt = readFile(file: 'templates/application-properties.tpl')
                        txt = txt.replace('$ZIPCODE_URL', params.ZIPCODE_URL).
                                replace('$PRICING_URL', params.PRICING_URL).
                                replace('$ORDERS_URL', params.ORDERS_URL).
                                replace('$SCHEDULING_URL', params.SCHEDULING_URL)
                        writeFile(file: "application.properties", text: txt)

                        env.appIps.split(',').each { address ->

                            def remote = [:]
                            remote.name = 'appServer'
                            remote.host = address
                            remote.user = USER
                            remote.password = PASSWORD
                            remote.allowAnyHosts = true

                            // The first first attempt may fail if cloud-init hasn't created user account yet
                            retry(20) {
                                sleep time: 10, unit: 'SECONDS'
                                sshPut remote: remote, from: 'application.properties', into: '/tmp'
                            }
                            sshPut remote: remote, from: 'scripts/vexpress-frontend.service', into: '/tmp'
                            sshPut remote: remote, from: 'scripts/configureAppserver.sh', into: '/tmp'
                            sshCommand remote: remote, command: 'chmod +x /tmp/configureAppserver.sh'
                            sshCommand remote: remote, sudo: true, command: "/tmp/configureAppserver.sh ${USER} ${env.apiUser} ${env.apiToken} ${env.BUILD_URL} ${env.version}"
                        }
                    }
                }
            }
        }
    }
}

def getInternalAddresses(id, resourceName) {
    return vraGetDeployment(
            deploymentId: id,
            expandResources: true)
            .resources.findAll({ it.name.startsWith(resourceName) }).collect { it.properties.networks[0].address }
}

def getDefaultServiceUrl(service) {
    // Store build state
    withAWS(credentials: 'jenkins') {
        s3Download(file: 'state.json', bucket: 'prydin-build-states', path: "vexpress/${service}/prod/state.json", force: true)
        def json = readJSON(file: 'state.json')
        print("Found deployment record: " + json)
        return json.rabbitMqIp
    }
}