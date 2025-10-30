import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { ScanArticleComponent } from './components/scan-article/scan-article.component';
import { MessureComponent } from './components/messure/messure.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { DetailsArticleComponent } from './components/details-article/details-article.component';
import { UsersComponent } from './components/users/users.component';
import { DashboardComponent } from './components/dashboard/dashboard.component'; // <-- import
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { StaticsComponent } from './components/statics/statics.component';
import { ModelResultsComponent } from './components/model-results/model-results.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'articles', component: ArticlesComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'scan', component: ScanArticleComponent, canActivate: [AuthGuard] },
  { path: 'mesures', component: MessureComponent, canActivate: [AuthGuard] },
  { path: 'add-user', component: AddUserComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent }, // <-- nouvelle route
  { path: 'statics', component: StaticsComponent, canActivate: [AuthGuard] },
  { path: 'model-results', component: ModelResultsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'details/:numOF',
    component: DetailsArticleComponent,
    canActivate: [AuthGuard],
  },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
