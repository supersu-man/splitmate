import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonModule, RouterModule],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit {
  constructor(private title: Title, private meta: Meta) {}

  ngOnInit() {
    this.title.setTitle('Splitmate — Splitting expenses, simplified');

    this.meta.addTags([
      { name: 'description', content: 'Effortlessly track group expenses, manage members, and settle up with ease. Your shared finances, finally organized — no login or backend required.' },
      { name: 'keywords', content: 'expense splitter, group expenses, bill splitting, shared finances, splitmate' },

      // Open Graph
      { property: 'og:title', content: 'Splitmate — Splitting expenses, simplified' },
      { property: 'og:description', content: 'Effortlessly track group expenses, manage members, and settle up with ease.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://supersu-man.github.io/splitmate/' },
      { property: 'og:image', content: 'https://supersu-man.github.io/splitmate/assets/group_people.png' },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Splitmate — Splitting expenses, simplified' },
      { name: 'twitter:description', content: 'Effortlessly track group expenses, manage members, and settle up with ease.' },
      { name: 'twitter:image', content: 'https://supersu-man.github.io/splitmate/assets/group_people.png' },

      // Canonical
      { name: 'robots', content: 'index, follow' },
    ]);
  }
}