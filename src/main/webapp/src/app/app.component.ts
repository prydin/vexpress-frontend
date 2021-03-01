import { Component, Injectable, OnInit, OnDestroy } from '@angular/core';
import { timer, Observable, Subscription } from 'rxjs'
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ZipResponse, DistanceResponse, SchedulingRequest } from './structs'
import { ClrLoadingState, ClrDatagridSortOrder } from '@clr/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-app';

  price: number = 0.0;

  distance: number = 0.0;

  fromAddress: string = '';

  toAddress: string = '';

  orders: SchedulingRequest[] = [];

  reloadTimer: Observable<number> = timer(30000,30000);

  timerSub?: Subscription;

  shipBtnState: ClrLoadingState = ClrLoadingState.DEFAULT;

  descSort = ClrDatagridSortOrder.DESC;

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

  ngOnInit(){
      this.reloadTimer = timer(30000,30000)
      this.timerSub = this.reloadTimer.subscribe({ next: (t: number) => this.loadOrders() });
  }

  ngOnDestroy() {
    if(this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  onCalculate() {
    let fz = this.pricingForm.get("fromZip")
    let tz = this.pricingForm.get("toZip")
    let w = this.pricingForm.get("weight")
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
    let fz = this.pricingForm.get("fromZip");
    let tz = this.pricingForm.get("toZip");
    let w = this.pricingForm.get("weight");
    if(tz == null || fz == null || w == null) {
      return
    }
    this.http.post<SchedulingRequest>("router/orders/orders", new SchedulingRequest(fz.value, tz.value, w.value)).subscribe({
      error: error => console.error('Error submitting order', error),
      next: x => {
        this.shipBtnState = ClrLoadingState.LOADING;
        timer(3000).subscribe({
          next: (t: number) => {
            this.loadOrders();
            this.shipBtnState = ClrLoadingState.DEFAULT;
          }
        })
      }
    });
  }

  loadOrders() {
    console.log("Load orders")
    this.http.get<SchedulingRequest[]>("router/scheduling/orders").
      subscribe({ next: data => this.orders = data });
  }
}
