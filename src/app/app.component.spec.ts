import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renders the router outlet, toast and confirmation dialog', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent], providers: [provideRouter([]), ConfirmationService, MessageService]
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(element.querySelector('p-toast')).not.toBeNull();
    expect(element.querySelector('p-confirmdialog')).not.toBeNull();
  });
});