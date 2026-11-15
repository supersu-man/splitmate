import { Meta, Title } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  it('sets the page title and search/social metadata on initialization', () => {
    const title = { setTitle: vi.fn() };
    const meta = { addTags: vi.fn() };
    const component = new HomeComponent(title as unknown as Title, meta as unknown as Meta);
    component.ngOnInit();
    expect(title.setTitle).toHaveBeenCalledWith(expect.stringContaining('Splitmate'));
    expect(meta.addTags).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'description', content: expect.any(String) }),
      expect.objectContaining({ property: 'og:type', content: 'website' }),
      expect.objectContaining({ name: 'twitter:card', content: 'summary_large_image' })
    ]));
  });
});