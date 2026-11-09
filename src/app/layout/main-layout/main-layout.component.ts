import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <!-- Backdrop for mobile sidebar -->
      <div
        *ngIf="isSidebarOpen"
        (click)="isSidebarOpen = false"
        class="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
      ></div>

      <!-- Left Sidebar -->
      <app-sidebar
        [isOpen]="isSidebarOpen"
        (closeSidebar)="isSidebarOpen = false"
      ></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
        <!-- Top Navbar -->
        <app-header
          (toggleSidebar)="isSidebarOpen = !isSidebarOpen"
        ></app-header>

        <!-- Dynamic Routed Content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  isSidebarOpen = false;
}
