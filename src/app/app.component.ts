import { Component, OnInit, NgZone } from '@angular/core';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Router } from '@angular/router';
import { SurveyDataService } from '../app/services/survey-data.service';
import * as moment from 'moment';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  private readyApp!: () => void;
  private isAppInForeground: Promise<void> = Promise.resolve();

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
      //    private localNotifications : LocalNotifications,
    private surveyDataService: SurveyDataService,
    private router : Router,
    private ngZone : NgZone,
    private alertCtrl: AlertController
  ) {

    this.initializeApp();
  }

  async ngOnInit() {
    await this.platform.ready();
    
    this.platform.pause.subscribe(() => {
      this.isAppInForeground = new Promise(resolve => { this.readyApp = resolve });
    });
    
    this.platform.resume.subscribe(() => {
      this.readyApp();
    });

    // handle notification click
      //this.localNotifications.on("click").subscribe(async (notification) => {
      LocalNotifications.addListener(
	  'localNotificationActionPerformed',
	  async (notif_action: ActionPerformed) => {
	      await this.isAppInForeground;
	      console.log("Not. data: ", JSON.stringify(notif_action))
	      let notification = notif_action.notification
	      // log that the user clicked on this notification
	      let logEvent = {
		  timestamp: moment().format(),
		  milliseconds: moment().valueOf(),
		  page: 'notification-' + moment(notification.extra.task_time).format(),
		  event: 'click',
		  module_index: notification.extra.task_index
	      };
	      this.surveyDataService.logPageVisitToServer(logEvent);
	      this.router.navigate(['survey/' + notification.extra.task_id]);
	  });
      // wait for device ready and then fire any pending click events
      await this.isAppInForeground;
      //this.localNotifications.fireQueuedEvents();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.show();
      this.splashScreen.hide();
    });
  }
}
