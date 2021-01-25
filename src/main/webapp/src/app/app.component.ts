import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ZipResponse } from './zipresponse'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-app';

  price: number = 0.0;

  fromAddress: string = ''

  toAddress: string = ''

  pricingForm = this.formBuilder.group({
    fromZip: '07945',
    toZip: '10001',
    weight: '1.0'
  });

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient) {}

  onCalculate() {
    var tz = this.pricingForm.get("fromZip")
    var fz = this.pricingForm.get("toZip")
    var w = this.pricingForm.get("weight")
    if(tz == null || fz == null || w == null) {
      return
    }
    var priceObs = this.http.get(
      'router/pricing/price?fromZip=' +
      fz.value + "&toZip=" + tz.value + "&weight=" + w.value)
    priceObs.subscribe({ next: x => this.price = <number>x });

    var fromObs = this.http.get<ZipResponse>('router/zipcode/zipcode/' + fz.value);
    fromObs.subscribe({ next: x => this.fromAddress = x.locality + ", " + x.state  });

    var toObs = this.http.get<ZipResponse>('router/zipcode/zipcode/' + tz.value);
    toObs.subscribe({ next: x => this.toAddress = x.locality + ", " + x.state });
  }
}
