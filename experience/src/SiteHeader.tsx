import {type ReactNode} from 'react';
import {type Language} from './JourneyControls.js';

export type Section = 'home'|'works'|'atelier'|'about';

export function siteHref(section:Section,language:Language):string{
  const params=new URLSearchParams();
  if(section!=='home')params.set('view',section);
  if(language==='en')params.set('lang','en');
  const query=params.toString();
  return import.meta.env.BASE_URL+(query?'?'+query:'');
}

export function workHref(work:'register'|'permutation',language:Language):string{
  const params=new URLSearchParams({work});
  if(language==='en')params.set('lang','en');
  return import.meta.env.BASE_URL+'?'+params.toString();
}

export function SiteHeader({language,active,onLanguage}:{
  language:Language;active:Section;onLanguage:()=>void;
}):ReactNode{
  const fr=language==='fr';
  const links:[Section,string][]=[
    ['home',fr?'Accueil':'Home'],
    ['works',fr?'Œuvres':'Works'],
    ['atelier',fr?'Atelier':'Workshop'],
    ['about',fr?'À propos':'About']
  ];
  return <header className="topbar">
    <div className="topbar-inner site-topline">
      <a className="brand" href={siteHref('home',language)} aria-label={fr?'POELIO, accueil':'POELIO, home'}>POELIO</a>
      <nav className="site-nav" aria-label={fr?'Navigation principale':'Main navigation'}>
        {links.map(([section,label])=><a key={section} href={siteHref(section,language)}
          aria-current={section===active?'page':undefined}>{label}</a>)}
      </nav>
      <button type="button" className="language-button" onClick={onLanguage}
        aria-label={fr?'Switch to English':'Passer en français'}>{fr?'EN':'FR'}</button>
    </div>
  </header>;
}

export function SiteFooter({language}: {language:Language}):ReactNode{
  const fr=language==='fr';
  return <footer className="site-footer"><div className="site-footer-inner">
    <a href={siteHref('home',language)}>POELIO</a>
    <nav aria-label={fr?'Informations':'Information'}>
      <a href={siteHref('about',language)}>{fr?'À propos':'About'}</a>
      <a href="https://github.com/fraware/POELIO" target="_blank" rel="noopener noreferrer">{fr?'Code source':'Source code'}</a>
      <a href="https://github.com/fraware/POELIO/blob/main/LICENSE-CONTENT.md" target="_blank" rel="noopener noreferrer">{fr?'Droits des textes':'Text permissions'}</a>
    </nav>
  </div></footer>;
}
