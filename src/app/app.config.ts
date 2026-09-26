import { ApplicationConfig, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from "primeng/config";
import { definePreset } from "@primeng/themes";

const MyPreset = definePreset(Aura, {
  semantic: {
      primary: {
          50: '{blue.50}',
          100: '{blue.100}',
          200: '{blue.200}',
          300: '{blue.300}',
          400: '{blue.400}',
          500: '{blue.500}',
          600: '{blue.600}',
          700: '{blue.700}',
          800: '{blue.800}',
          900: '{blue.900}',
          950: '{blue.950}'
      }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(), 
    providePrimeNG({
      theme: { preset: MyPreset , options: { darkModeSelector: false }} 
    }),
    MessageService,
    ConfirmationService
  ]
};

