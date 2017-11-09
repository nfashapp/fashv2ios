import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LoadingController } from 'ionic-angular';
import { SigninPage } from '../signin/signin';
import { Appsetting } from '../../providers/appsetting';
import 'rxjs/add/operator/map';
import { ToastController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { TabsPage } from '../tabs/tabs';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { BirthdayPage } from '../birthday/birthday';
import { TermsPage } from '../terms/terms';
import { PrivacypolicyPage } from '../privacypolicy/privacypolicy';
import firebase from 'firebase';
import { Firebase } from '@ionic-native/firebase';
import { Network } from '@ionic-native/network';
import { Diagnostic } from '@ionic-native/diagnostic';
import { GenderPage } from '../gender/gender';
import { SportyfyPage } from '../sportyfy/sportyfy';




@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  email: any; token;
  submitted = false;
  User: any;fb;
  userProfile: any = null;
  public userfbdata: any;

  navigator: any;
  Connection: any;




  onsubmit() { this.submitted = true; }
  public data = ''; alertCtrl;

  constructor(public navCtrl: NavController,
    public toastCtrl: ToastController,
    public http: Http,
    public loadingCtrl: LoadingController,
    public appsetting: Appsetting,
    private facebook: Facebook,
    public platform: Platform,
    public afAuth: AngularFireAuth,
    private geolocation: Geolocation,
    private firebase: Firebase,
    private network: Network,
    private diagnostic: Diagnostic
  ) {
    this.fb = this.facebook;
    platform.ready().then(() => {
      var lastTimeBackPress = 0;
      var timePeriodToExit = 2000;

      platform.registerBackButtonAction(() => {
        // get current active page
        let view = this.navCtrl.getActive();
        if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {
          this.platform.exitApp(); //Exit from app
        } else {
          // alert('Press back again to exit App?');
          let toast = this.toastCtrl.create({
            message: 'Press back again to exit from app?',
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
          lastTimeBackPress = new Date().getTime();
        }
      });
    });
    this.ionViewDidEnter();


  }


  public register(signup) {
    this.firebase.getToken()
      .then(token => {
        this.token = token
      }) // save the token server-side and use it to push notifications to this device
      .catch(error => console.error('Error getting token', error));
    this.firebase.onTokenRefresh().subscribe(
      token => {
        console.log(`The new token is ${token}`);
        this.token = token
      },
      error => {
        console.error('Error refreshing token', error);
      });

    console.log(signup)
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    if (signup.value.password.indexOf(' ') >= 0) {
      let toast = this.toastCtrl.create({
        message: 'Space not allowed',
        duration: 3000,
        position: 'middle'
      });
      toast.present();
    } else {
      var data1 = {
        email: signup.value.email,
        first_name: signup.value.first_name,
        lastname: signup.value.last_name,
        password: signup.value.password,
        cpassword: signup.value.cpassword,
        tokenid: this.token

      }
      console.log(data1)
      var Serialized = this.serializeObj(data1);
      var Loading = this.loadingCtrl.create({
        spinner: 'bubbles',
        showBackdrop: false,
        cssClass: 'loader'

      });

      Loading.present().then(() => {
        this.http.post(this.appsetting.myGlobalVar + 'users/registration', {
          email: signup.value.email,
          first_name: signup.value.first_name,
          lastname: signup.value.last_name,
          password: signup.value.password,
          cpassword: signup.value.cpassword,
          tokenid: this.token
        }, options)
          .map(res => res.json())
          .subscribe(data => {
            this.data = data;
            console.log(this.data);
            if (data.status == 0) {

              var data2 = JSON.stringify({
                email: signup.value.email,
                password: signup.value.password,
                tokenid: this.token

              });

              console.log(data2)
              this.http.post(this.appsetting.myGlobalVar + 'users/login', data2, options).map(res => res.json()).subscribe(data => {
                Loading.dismiss();
                if (data.error == 0) {
                  this.data = data;
                  console.log(this.data);
                  /************ call location method to get current location ****************/
                  this.location();
                  localStorage.setItem("USER_DATA", JSON.stringify(data));
                  localStorage.setItem("swipe_status", JSON.stringify(data.data.User.swipe_status));
                  localStorage.setItem('fitting_status', JSON.stringify(data.data.User.fitting_status));
                  localStorage.setItem('favourite_status', JSON.stringify(data.data.User.favourite_status));
                  var user_id = data.data.User.id;
                  console.log(user_id)
                  localStorage.setItem("USERID", data.data.User.id);
                  console.log(localStorage.getItem("USERID"))
                  this.navCtrl.push(GenderPage);
                }
              })
            } else {

              Loading.dismiss();
              if (signup.value.cpassword != null) {
                signup.value.cpassword = signup.value.cpassword
              }

              let toast = this.toastCtrl.create({
                message: data.msg,
                duration: 3000,
                cssClass: 'toastCss',
                position: 'middle',
              });
              toast.present();
            }
          })
      });

    }
  }

  location() {
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp)
      console.log(resp.coords.longitude)
      console.log(resp.coords.latitude)
      this.diagnostic.switchToLocationSettings();

      this.http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + resp.coords.latitude + ',' + resp.coords.longitude + '&sensor=true').map(res => res.json()).subscribe(data => {
        console.log('rahul');
        console.log(JSON.stringify(data))
        console.log(data.results);
        var address = data.results[0].formatted_address;
        localStorage.setItem('location', address);
        //alert(address)
        for (var i = 0; i < data.results[0].address_components.length; i++) {
          for (var b = 0; b < data.results[0].address_components[i].types.length; b++) {

            if (data.results[0].address_components[i].types[b] == "country") {
              //this is the object you are looking for
              var country = data.results[0].address_components[i];
              console.log(country.short_name)
              if (country.short_name) {
                localStorage.setItem('country', country.short_name)
              } else {
                localStorage.setItem('country', 'US');
              }
              var autocompleteOptions = {
                componentRestrictions: { country: country.short_name },
                types: ['geocode']
              };


            }
            if (data.results[0].address_components[i].types[b] == "administrative_area_level_1") {
              var country = data.results[0].address_components[i];
              console.log(country.short_name)
              localStorage.setItem('city', country.long_name);
              var autocompleteOptions = {
                componentRestrictions: { country: country.short_name },
                types: ['geocode']
              };


            }
          }
        }
      })
      // })
      //var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+resp.coords.latitude+','+resp.coords.longitude+'&key=AIzaSyAy-7ToF2VeQ5l733vRis8gIK0MhCmj53k';
    }).catch((error) => {

      let toast = this.toastCtrl.create({
        message: 'Please enable your location',
        duration: 5000,
        cssClass: 'toastCss',
        position: 'middle',
      });
      toast.present();
      this.diagnostic.switchToLocationSettings();
      console.log('Error getting location', error);
    });
  }

  skip() {
    this.location();
    this.navCtrl.push(TabsPage);
  }

  fbLogin1(){
   // alert('fblogin');
    this.facebook.login(['public_profile', 'user_friends', 'email'])
    .then((res: FacebookLoginResponse) => {
      console.log('Logged into Facebook!', res);
     // alert(JSON.stringify(res));
      let headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
      let options = new RequestOptions({ headers: headers });
      this.http.post('https://graph.facebook.com/v2.9/' + res.authResponse.userID + '?fields=id,email,name,birthday,locale,age_range,gender,first_name,last_name&access_token=' + res.authResponse.accessToken, options).map(res => res.json()).subscribe(data => {
        this.userfbdata = data;
        this.userProfile = "https://graph.facebook.com/" + data.id + "/picture?type=large";

        console.log('User Image',this.userProfile);
        console.log('public profile:',JSON.stringify(data));
        localStorage.setItem('userfbdata', JSON.stringify(data));
     
      console.log('FB ID',res.authResponse.userID);
      console.log('AccessToken',res.authResponse.accessToken);
      localStorage.setItem('logIn_role', 'FB');
      localStorage.setItem('User', JSON.stringify(this.userfbdata));
      this.User = JSON.parse(localStorage.getItem('User'));
      var data_fb = {
        first_name: this.User.name,
        last_name: "",
        email: this.User.email,
        facebook_id: this.User.id,
        image: this.userProfile,
        phone: "",
        dob: "",
        gender: this.User.gender,
        cards: "",
        address: "",
        tokenid: this.token
      };
     // alert(JSON.stringify(data_fb));
    
      var Serialized = this.serializeObj(data_fb);
      var Loading = this.loadingCtrl.create({
        spinner: 'bubbles',
        showBackdrop: false,
        cssClass: 'loader'
      });
      Loading.present().then(() => {
        this.http.post(this.appsetting.myGlobalVar + 'users/fblogin', Serialized, options)
          .map(res => res.json())
          .subscribe(datares => {
          // alert('FB login success');
           //  alert(JSON.stringify(datares));
            Loading.dismiss();
            localStorage.setItem("USER_DATA", JSON.stringify(datares))
            localStorage.setItem("swipe_status", JSON.stringify(datares.data.User.swipe_status));
            localStorage.setItem('fitting_status', JSON.stringify(datares.data.User.fitting_status));
            localStorage.setItem('favourite_status', JSON.stringify(datares.data.User.favourite_status));
            localStorage.setItem("USERID", datares.data.User.id)
            this.geolocation.getCurrentPosition().then((resp) => {
              console.log(resp)
              console.log(resp.coords.longitude)
              headers.append('Content-Type', 'application/json');
              this.http.post('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + resp.coords.latitude + ',' + resp.coords.longitude + '&key=AIzaSyAy-7ToF2VeQ5l733vRis8gIK0MhCmj53k', options).map(res => res.json()).subscribe(data => {
                console.log(JSON.stringify(data));
                console.log(data.results);
                var address = data.results[0].address_components[0].long_name + ', ' + data.results[0].address_components[1].long_name;
                for (var i = 0; i < data.results[0].address_components.length; i++) {
                  for (var b = 0; b < data.results[0].address_components[i].types.length; b++) {
                    if (data.results[0].address_components[i].types[b] == "country") {
                      //this is the object you are looking for
                      var country = data.results[0].address_components[i];
                      if (country.short_name) {
                        localStorage.setItem('country', country.short_name);
                      } else {
                        localStorage.setItem('country', 'US');
                      }
                      var autocompleteOptions = {
                        componentRestrictions: { country: country.short_name },
                        types: ['geocode']
                      };
                    }
                    if (data.results[0].address_components[i].types[b] == "administrative_area_level_1") {
                      var country = data.results[0].address_components[i];
                      console.log(country.short_name)
                      localStorage.setItem('city', country.long_name);
                      var autocompleteOptions = {
                        componentRestrictions: { country: country.short_name },
                        types: ['geocode']
                      };
                    }
                  }
                }
              })
            }).catch((error) => {
              console.log('Error getting location', error);
            });
            if (datares.data.User.allreadyloggedin == 1) {
              this.navCtrl.push(TabsPage);
            } else {
              this.navCtrl.push(BirthdayPage);
            }

          },err=>{
            //alert(JSON.stringify(err));
            //alert('Failed');
          })
      });
    })

    })
    .catch(e => console.log('Error logging into Facebook', e));
  this.facebook.logEvent(this.facebook.EVENTS.EVENT_NAME_ADDED_TO_CART);
  }

  serializeObj(obj) {
    var result = [];
    for (var property in obj)
      result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));

    return result.join("&");
  }
  signinPage() {
    this.navCtrl.push(SigninPage);
  }

  terms() {
    this.navCtrl.push(TermsPage);
  }

  privacy() {
    this.navCtrl.push(PrivacypolicyPage);
  }
  ionViewDidEnter() {
    console.log('rahul');
    console.log(window.navigator.onLine);
    if (window.navigator.onLine == true) {
    } else {
      let toast = this.toastCtrl.create({
        message: 'Network connection failed',
        duration: 3000,
        position: 'top'
      });
      toast.present();
    }

  }
  
}