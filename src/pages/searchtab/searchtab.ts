import { Component, Injectable } from '@angular/core';
import { NavController, Nav } from 'ionic-angular';
import { CardswipePage } from '../cardswipe/cardswipe';
import { ProductdetailsPage } from '../productdetails/productdetails';
import { SigninPage } from '../signin/signin';
import { TabsPage } from '../tabs/tabs';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LoadingController, AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { MediaPlugin } from 'ionic-native';
import { File } from '@ionic-native/file';
import { Appsetting } from '../../providers/appsetting';
import 'rxjs/add/operator/map';
import { Events } from 'ionic-angular';
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Rx";
import { Media, MediaObject } from '@ionic-native/media';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SocialSharing } from '@ionic-native/social-sharing';

@Component({
  selector: 'page-searchtab',
  templateUrl: 'searchtab.html'
})
@Injectable()
export class SearchtabPage {
  charSearch: any;
  pages(arg0: any): any {
    throw new Error("Method not implemented.");
  }
  pagenoinc:any = 1;
  length: number;
  allProducts: any = [];
  /*********** variables for music player */
  index;
  bit: boolean = true;
  playing: boolean = true;
  currentTrack: any;
  title: any;
  audioIndex;
  setvarNow: any;
  tracknow: boolean = true;
  audurl; audio; playsong: any = 0;

  constructor(
    public navCtrl: NavController,
    public http: Http,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public appsetting: Appsetting,
    public toastCtrl: ToastController,
    public events: Events,
    public nav: Nav,
    public media: Media,
    public inappBrowser: InAppBrowser,
    private socialSharing: SocialSharing,

  ) {
    if (localStorage.getItem('currenttrack')) {
      this.currentTrack = JSON.parse(localStorage.getItem('currenttrack'));
      console.log(this.currentTrack);
    }
    this.setvarNow = "playTrack";
    events.subscribe('page', (myFav) => {
      console.log(myFav);
      clearInterval(this.appsetting.interval);

    })
  }

  protected resumeHalted = false;
  protected resumeSubject = new Subject<any>();

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    // this.allProducts = [];
    // this.myFavs();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

  SearchBrand(char) {
    console.log(char.length);
    var aa = this;
    this.charSearch = char;
    this.allProducts = [];
    this.pagenoinc = 1;
    if(char.length > 0){
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    let options = new RequestOptions({ headers: headers });
    var user_id = localStorage.getItem('USERID');
    if (user_id == null || user_id == undefined) {
      this.ConfirmUser();
    } else {
      var postdata = {
        search: char,
      };
      console.log(postdata);
      var serialized = this.serializeObj(postdata);

      var Loading = this.loadingCtrl.create({
        spinner: 'bubbles',
      });
      Loading.present().then(() => {
      this.http.post(this.appsetting.myGlobalVar + 'users/firstsearchbrandfromapp', serialized, options)
        .map(res => res.json()).subscribe(data => {
          Loading.dismiss();
          console.log(data);
          if (data.status == 0) {
            this.pages = data.pages;
            data.data.forEach(function (value, key) { 
              console.log(value);
              /*********************** */
              if (value[0].image != null) {
                console.log(value[0].image);
                var search = value[0].image.search('http://');
                var searchhttps = value[0].image.search('https://');
                if (search >= 0 || searchhttps >= 0) {
                  //value.Lookbook.brandlink = 1;
                } else {
                  value[0].image = 'https:' + value[0].image;
                }
              }
              /*********************** */
              aa.allProducts.push(value[0]);
            });
            
            console.log(aa.allProducts);
          } else {
            this.allProducts = [];
            this.showToast('No products added to My Favorites yet');
          }
          
        })
      });
    }
  }else{
    this.allProducts = [];
  }
  }
 /************ this function is used for pagination ********************/
 public nextSearchProduct() {
   var aa = this;
  let headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
  let options = new RequestOptions({ headers: headers });
  var user_id = localStorage.getItem("USERID");
  console.log(this.pages);
  if (this.pagenoinc < this.pages) {
    this.pagenoinc++;
  } 
  var postdata = {
    search: this.charSearch,
    pages: this.pagenoinc
  };
  console.log(postdata);
  var serialized = this.serializeObj(postdata);
  this.http.post(this.appsetting.myGlobalVar + 'users/searchbrandfromapp', serialized, options).map(res => res.json()).subscribe(data => {
    console.log(data)
    if (data.data) {
      this.length = 1;
      data.data.forEach(function (value, key) { 
        console.log(value);
        /*********************** */
        if (value[0].image != null) {
          console.log(value[0].image);
          var search = value[0].image.search('http://');
          var searchhttps = value[0].image.search('https://');
          if (search >= 0 || searchhttps >= 0) {
          } else {
            value[0].image = 'https:' + value[0].image;
          }
        }
        /*********************** */
        aa.allProducts.push(value[0]);
      });
    } else {
      this.length = 0;
    }
    
    console.log(this.allProducts);
  })
}

myFavourite(id,url,aff) {
  var user_id = localStorage.getItem('USERID');
  if (user_id == null || undefined) {
    this.ConfirmUser();
  } else {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    let options = new RequestOptions({ headers: headers });
    var postdata = {
      productid: id,
      userid: user_id,
      link: url,
      affiliate: parseInt(aff)
    };
    console.log(postdata);
    var serialized = this.serializeObj(postdata);

    var Loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      showBackdrop: false,
      cssClass: 'loader'
    });

    this.http.post(this.appsetting.myGlobalVar + 'lookbooks/addtofavourite', serialized, options).map(res => res.json()).subscribe(data => {
      Loading.dismiss();
      console.log(data)
      if (data.status == 0) {
        this.showToast(data.msg);
        console.log(data.bit)
        if (data.bit == 1) {
          this.events.publish('Liked', '2');  // only for the stacks, so that Red dot remains in the next card
        } else {
          this.events.publish('Liked', '0');
        }
      } else {
        this.showToast(data.msg);
      }


    })
  }
}
socailsharing(link) {
  console.log(link);
  this.socialSharing.share(null, null, null, link)
    .then(() => {
      //alert("success");
    },
    () => {
      //	alert("failed");
    })
}

public doInfinite(infiniteScroll: any) {
  console.log(infiniteScroll)
  this.nextSearchProduct();
  setTimeout(() => {
    infiniteScroll.complete()

  }, 500)
};

  ConfirmUser() {
    let alert = this.alertCtrl.create({
      title: 'FASH',
      message: 'Please login to use this feature.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.navCtrl.push(TabsPage);
          }
        },
        {
          text: 'Login',
          handler: () => {
            this.nav.setRoot(SigninPage);
            this.nav.popToRoot();
          }
        }
      ]
    });
    alert.present();
  }

  showToast(msg) {
    var toast = this.toastCtrl.create({
      message: msg,
      duration: 2500,
      cssClass: 'toastCss',
      position: 'middle',
    });
    toast.present();
  }

  /************ function for play audio ********/
  playTrack(track) {
    this.bit = true;
    //var aa = this;
    if (this.appsetting.audio != undefined) {
      this.currentTrack = track;
      this.appsetting.audio.play();
    } else {
      track.loaded = true;
      track.playing = true;
      this.currentTrack = track;
      const file: MediaObject = this.media.create(this.currentTrack.music);
      localStorage.setItem('currenttrack', JSON.stringify(this.currentTrack));
      this.appsetting.audio = file;
      this.appsetting.audio.play();
    }

    this.appsetting.audio.onSuccess.subscribe(() => {
      if (this.tracknow == true) {
        //localStorage.setItem('currenttrack',this.currentTrack);
        this.nexttTrack();
      }
    }, err => {
    })

  }

  pauseTrack(track) {
    track.playing = false;
    this.appsetting.audio.pause();
    this.currentTrack = track;
  }

  pausetyTrack(track) {
    this.bit = false;
    track.playing = false;
    this.appsetting.audio.pause();
    this.currentTrack = track;
  }

  nexttTrack() {
    let index = this.appsetting.tracks.indexOf(this.currentTrack);
    index >= this.appsetting.tracks.length - 1 ? index = 0 : index++;
    this.appsetting.audio = undefined;
    this.playTrack(this.appsetting.tracks[index]);
  }

  nextTrack() {
    this.setvarNow = "nextTrack";
    let index = this.appsetting.tracks.indexOf(this.currentTrack);
    index >= this.appsetting.tracks.length - 1 ? index = 0 : index++;
    this.appsetting.audio = undefined;
    this.playTrack(this.appsetting.tracks[index]);
  }

  prevTrack() {
    this.setvarNow = "prevTrack";
    let index = this.appsetting.tracks.indexOf(this.currentTrack);
    index > 0 ? index-- : index = this.appsetting.tracks.length - 1;
    this.appsetting.audio = undefined;
    this.playTrack(this.appsetting.tracks[index]);
  }
  /*************** In App purchase for brands *********************/
  InAppPurchage(link) {
    if (link != null && link != "") {
      var target = '_blank';
      var options = 'location=no';
    //   var Loading = this.loadingCtrl.create({
    //     content: "FASH taking you to your interested item!",
    //     duration: 5000
    //  });
    //  Loading.present().then(() => {
      var brandsite = this.inappBrowser.create(link, target, options);
      console.log(link);
      console.log(target);
      console.log(brandsite);
      brandsite.on('loadstart').subscribe((e) => {

        console.log(e);
        let url = e.url;
        console.log(url);
      }, err => {
        console.log("InAppBrowser loadstart Event Error: " + err);
      });

      brandsite.on('exit').subscribe((e) => {
      })
   // })
    } else {
      // let toast = this.toastCtrl.create({
      //   message: 'Target url empty.',
      //   duration: 3000,
      //   position: 'top'
      // });
      // toast.present();
    }
  }
  serializeObj(obj) {
    var result = [];
    for (var property in obj)
      result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));

    return result.join("&");
  }

}
