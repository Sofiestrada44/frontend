import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './pages/layout/layout'
import { Home } from './pages/home/home';
import { Monitoreo } from './pages/monitoreo/monitoreo';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: '', component: Layout, canActivate: [authGuard], children: [
        { path: 'home', component: Home },
        { path: 'monitoreo', component: Monitoreo },
        { path: 'dashboard', component: Dashboard },
        { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
},
{ path: '**', redirectTo: 'login'}
];
