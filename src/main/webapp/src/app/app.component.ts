import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ZipResponse, DistanceResponse, SchedulingRequest } from './structs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-app';

  price: number = 0.0;

  distance: number = 0.0;

  fromAddress: string = '';

  toAddress: string = '';

  orders: SchedulingRequest[] = [];

  pricingForm = this.formBuilder.group({
    fromZip: '07945',
    toZip: '10001',
    weight: '1.0'
  });

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient) {
      this.loadOrders();
    }

  onCalculate() {
    var fz = this.pricingForm.get("fromZip")
    var tz = this.pricingForm.get("toZip")
    var w = this.pricingForm.get("weight")
    if(tz == null || fz == null || w == null) {
      return
    }
    var priceObs = this.http.get(
      'router/pricing/price?fromZip=' +
      fz.value + "&toZip=" + tz.value + "&weight=" + w.value)
    priceObs.subscribe({ next: x => this.price = <number>x });

    this.http.get<ZipResponse>('router/zipcode/zipcode/' + fz.value).
      subscribe({ next: x => this.fromAddress = x.locality + ", " + x.state  });

    this.http.get<ZipResponse>('router/zipcode/zipcode/' + tz.value).
      subscribe({ next: x => this.toAddress = x.locality + ", " + x.state });

    this.http.get<DistanceResponse>('router/zipcode/distance?fromZip=' + fz.value + '&toZip=' + tz.value).
       subscribe({ next: x => this.distance = x.distance });
  }

  onShip() {
    var fz = this.pricingForm.get("fromZip");
    var tz = this.pricingForm.get("toZip");
    var w = this.pricingForm.get("weight");
    if(tz == null || fz == null || w == null) {
      return
    }
    this.http.post<SchedulingRequest>("router/orders/orders", new SchedulingRequest(fz.value, tz.value, w.value)).subscribe({
      error: error => console.error('Error submitting order', error)}
    );
  }

  loadOrders() {
    this.http.get<SchedulingRequest[]>("router/scheduling/orders").
      subscribe({ next: data => this.orders = data})
  }
}
