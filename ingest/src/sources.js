/* Pages the TinyFish agent scrapes. Edit freely.
   Check each site's terms of use and robots.txt before you scrape it. Use only pages that are public (no login).
   type_hint is used when the page does not say what kind of opportunity an item is. */
export const SOURCES = [
  { url: 'https://devfolio.co/hackathons', name: 'Devfolio hackathons', type_hint: 'hackathon' },
  { url: 'https://unstop.com/hackathons', name: 'Unstop hackathons', type_hint: 'hackathon' },
  { url: 'https://unstop.com/internships', name: 'Unstop internships', type_hint: 'internship' },
  { url: 'https://internshala.com/internships/', name: 'Internshala internships', type_hint: 'internship' },
  { url: 'https://www.sih.gov.in', name: 'Smart India Hackathon', type_hint: 'hackathon' },
];
export const REFRESH_HOURS = 12;   // how often each source is scraped again
export const MAX_ACTIVE = 2;       // TinyFish allows 2 agent runs at the same time on this wallet
