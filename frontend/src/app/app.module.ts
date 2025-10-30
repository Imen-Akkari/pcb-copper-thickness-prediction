import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './auth/login/login.component';
import { ScanArticleComponent } from './components/scan-article/scan-article.component';
import { MessureComponent } from './components/messure/messure.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { DetailsArticleComponent } from './components/details-article/details-article.component';
import { UsersComponent } from './components/users/users.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { StaticsComponent } from './components/statics/statics.component';
import { ModelResultsComponent } from './components/model-results/model-results.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ArticlesComponent,
    LoginComponent,
    ScanArticleComponent,
    MessureComponent,
    AddUserComponent,
    DetailsArticleComponent,
    UsersComponent,
    DashboardComponent,
    HomeComponent, 
    StaticsComponent,
    ModelResultsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,   
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

