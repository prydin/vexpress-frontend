export class DistanceResponse {
  public distance: number = 0;
  public unit: string = 'miles';
}

export class ZipResponse {
  public locality: string = '';
  public state: string = '';
  public zipcode: number = 0;
  public lat: number = 0;
  public lon: number = 0;
}

export class SchedulingRequest {
  constructor(fromZip: string, toZip : string, weight : number) {
    this.fromZip = fromZip;
    this.toZip = toZip;
    this.weight = weight;
  }
  public fromZip : string;
  public toZip: string;
  public trackingNumber: string = '';
  public weight: number;
  public timeSubmitted: number = 0;
  public status: string = 'Submitted';
}
