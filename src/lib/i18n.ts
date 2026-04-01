export type Locale = 'sv' | 'en';

export const TRANSLATIONS = {
  sv: {
    // --- Navbar ---
    nav: {
      home: 'HEM',
      corporate: 'FÖR FÖRETAG',
      students: 'FÖR STUDENTER',
      about: 'OM OSS',
      contact: 'Kontakt',
      themedark: 'Mörkt',
      themelight: 'Ljust',
      themesystem: 'System',
      langSv: 'Svenska (aktiv)',
      langEn: 'Engelska',
      openMenu: 'Öppna meny',
      closeMenu: 'Stäng meny',
      mainNav: 'Huvudnavigation',
      mobileNav: 'Mobilnavigation',
      chooseTheme: 'Välj tema',
    },

    // --- Footer ---
    footer: {
      description:
        'TKL Nexus är ett förlängt organ till Teknologkåren som arbetar mot näringslivet, skapar samarbeten och bidrar till att förbättra studietiden för aktiva studenter.',
      quickLinks: 'Snabblänkar',
      ourPages: 'Våra Sidor',
      ourSections: 'Våra Sektioners Sidor',
      contactLabel: 'Kontakt',
      copyright: 'Alla rättigheter förbehålls.',
      builtBy: 'Byggd av Teknologkårens arbetsmarknadsgrupp',
      links: {
        students: 'För studenter',
        corporate: 'För företag',
        about: 'Om oss',
        contact: 'Kontakt',
      },
    },

    // --- Home page ---
    home: {
      badge: 'Teknologkårens Arbetsmarknadsportal',
      heading: 'Bygger broar till',
      headingAccent: 'framtidens karriärer',
      description:
        'TKL Nexus förenar LTU-studenter och framgångsrika företag via exjobb, events, förmåner och direktkontakt — allt samlat på ett ställe.',
      ctaStudents: 'För studenter',
      ctaCorporate: 'För företag',
      featuresTitle: 'Vad vi erbjuder',
      featuresSubtitle: 'Tre ingångar — en portal. Välj din väg.',
      ctaBannerTitle: 'Redo att komma igång?',
      ctaBannerSubtitle: 'Kontakta oss så berättar vi hur ett samarbete kan se ut.',
      ctaBannerBtn: 'Kontakta oss',
      features: {
        students: {
          title: 'För Studenter',
          description: 'Hitta exjobb, praktik och karriärmöjligheter som passar din utbildning.',
          linkLabel: 'Utforska möjligheter',
        },
        corporate: {
          title: 'För Företag',
          description: 'Nå framtidens ingenjörer vid LTU och bygg långsiktiga relationer.',
          linkLabel: 'Samarbeta med oss',
        },
        about: {
          title: 'Om TKL Nexus',
          description: 'Lär dig mer om Teknologkårens arbetsmarknadsgrupp och vår mission.',
          linkLabel: 'Läs vår historia',
        },
      },
    },

    // --- Students page ---
    students: {
      badge: 'För Studenter',
      heading: 'Din brygga till',
      headingAccent: 'arbetslivet',
      description:
        'Nexus kopplar ihop dig med företag, events och möjligheter som är relevanta för din utbildning.',
      ctaExplore: 'Utforska möjligheter',
      ctaDeals: 'Nexus Deals',
      benefitsTitle: 'Vad vi erbjuder',
      jobsTitle: 'Exjobb',
      dealsTitle: 'Nexus Deals',
      dealsSubtitle:
        'Exklusiva rabatter och erbjudanden för dig som är kårmedlem i Teknologkåren.',
      dealsBtn: 'Se alla deals',
      benefits: {
        learn: {
          title: 'Lär & Utvecklas',
          description: 'Praktisk erfarenhet från ledande teknikföretag i norra Sverige och bortom.',
        },
        career: {
          title: 'Kickstarta Karriären',
          description:
            'Hitta drömjobbet redan som student via Nexus Portal och direktkontakter.',
        },
        network: {
          title: 'Nätverka',
          description: 'Bygg kontakter via arbetsmarknadsdagar, mingel och sektionsevents.',
        },
      },
    },

    // --- Corporate page ---
    corporate: {
      badge: 'För Företag',
      heading: 'Nå framtidens',
      headingAccent: 'ingenjörer',
      description:
        'TKL Nexus hjälper er att komma i kontakt med LTU-studenter via event, aktiviteter, jobbannonser och kårförmåner.',
      ctaContact: 'Kontakta oss',
      ctaServices: 'Se våra tjänster',
      servicesTitle: 'Hur vi kan hjälpa er',
      ctaBannerTitle: 'Redo att komma igång?',
      ctaBannerSubtitle: 'Vi berättar hur ett samarbete kan se ut för er.',
      ctaBannerBtn: 'Kontakta oss',
      stats: {
        members: 'Aktiva kårmedlemmar',
        programs: 'Unika utbildningar',
        sections: 'Olika sektioner',
      },
      services: {
        events: {
          title: 'Events & Relations',
          description:
            'Arbetsmarknadsdagar, studiebesök och mingel där du möter aktiva arbetsgivare och studenter.',
          linkLabel: 'Se kommande events',
        },
        portal: {
          title: 'Nexus Portal',
          description:
            'Annonsera praktik, exjobb och tjänster till rätt målgrupp med tydliga kontaktvägar.',
          linkLabel: 'Publicera annons',
        },
        partnership: {
          title: 'Samarbete',
          description:
            'Vi hjälper dig att synas på webben, sociala kanaler, på campus och via Nexus Deals.',
          linkLabel: 'Läs om samarbete',
        },
      },
    },

    // --- About page ---
    about: {
      badge: 'Om Oss',
      heading: 'Vi bygger',
      headingAccent: 'broar',
      description:
        'TKL Nexus är Teknologkårens arbetsmarknadsprojektgrupp och arbetar med löpande företagskontakt för att skapa mervärde och förbättra studietiden för kårmedlemmar på campus.',
      ctaContact: 'Kontakta oss',
      whatIsTitle: 'Vad är TKL Nexus?',
      contactTitle: 'Kontakta oss',
      reachOutTitle: 'Hör av dig',
      timelineTitle: 'Vår resa',
      whatIs: {
        p1: 'Verksamheten omfattar bland annat Fyents & Relations, som stöttar det operativa arbetet kring event och företagsuppföljning, Nexus Portal som i dagsläget fungerar som en portal för exjobb, samt Nexus Deals, där kårmedlemmarnas förmåner samlas på ett och samma ställe.',
        p2: 'För studenter hjälper vi till att hitta exjobb via Nexus Portal, samla kårförmåner i Nexus Deals och hålla koll på aktuella event och aktiviteter i Ludds eventkalender.',
        p3: 'För företag och partners som söker framtida ingenjörer, eller vill bidra till en mer attraktiv studietid, erbjuder vi samarbeten genom event, aktiviteter, annonsering och erbjudanden till våra kårmedlemmar.',
      },
      timeline: {
        founded: { title: 'TKL Nexus grundas', desc: 'Arbetsmarknadsprojektgruppen bildas under Teknologkåren vid LTU.' },
        firstEvent: { title: 'Första arbetsmarknadsdagen', desc: 'Nexus arrangerar sitt första stora event med över 20 företag på campus.' },
        portal: { title: 'Nexus Portal lanseras', desc: 'En digital plattform för exjobb och praktikplatser görs tillgänglig för kårmedlemmar.' },
        deals: { title: 'Nexus Deals introduceras', desc: 'Exklusiva förmåner och rabatter samlas för alla kårmedlemmar.' },
        growth: { title: 'Plattformen växer', desc: 'Utökad funktionalitet, fler samarbetspartners och en ny digital närvaro.' },
      },
    },
  },

  en: {
    // --- Navbar ---
    nav: {
      home: 'HOME',
      corporate: 'FOR COMPANIES',
      students: 'FOR STUDENTS',
      about: 'ABOUT US',
      contact: 'Contact',
      themedark: 'Dark',
      themelight: 'Light',
      themesystem: 'System',
      langSv: 'Swedish',
      langEn: 'English (active)',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      mainNav: 'Main navigation',
      mobileNav: 'Mobile navigation',
      chooseTheme: 'Choose theme',
    },

    // --- Footer ---
    footer: {
      description:
        'TKL Nexus is an arm of Teknologkåren, working with industry to create partnerships and improve student life for active members.',
      quickLinks: 'Quick Links',
      ourPages: 'Our Sites',
      ourSections: 'Section Sites',
      contactLabel: 'Contact',
      copyright: 'All rights reserved.',
      builtBy: 'Built by the TKL Nexus team',
      links: {
        students: 'For students',
        corporate: 'For companies',
        about: 'About us',
        contact: 'Contact',
      },
    },

    // --- Home page ---
    home: {
      badge: "Teknologkåren's Career Portal",
      heading: 'Building bridges to',
      headingAccent: 'future careers',
      description:
        'TKL Nexus connects LTU students and industry-leading companies through thesis projects, events, benefits and direct contacts — all in one place.',
      ctaStudents: 'For students',
      ctaCorporate: 'For companies',
      featuresTitle: 'What we offer',
      featuresSubtitle: 'Three entry points — one portal. Choose your path.',
      ctaBannerTitle: 'Ready to get started?',
      ctaBannerSubtitle: 'Contact us and we will explain how a collaboration could look.',
      ctaBannerBtn: 'Contact us',
      features: {
        students: {
          title: 'For Students',
          description: 'Find thesis projects, internships and career opportunities matching your degree.',
          linkLabel: 'Explore opportunities',
        },
        corporate: {
          title: 'For Companies',
          description: "Reach LTU's future engineers and build long-term relationships.",
          linkLabel: 'Collaborate with us',
        },
        about: {
          title: 'About TKL Nexus',
          description: "Learn more about Teknologkåren's career group and our mission.",
          linkLabel: 'Read our story',
        },
      },
    },

    // --- Students page ---
    students: {
      badge: 'For Students',
      heading: 'Your bridge to',
      headingAccent: 'working life',
      description:
        'Nexus connects you with companies, events and opportunities relevant to your degree.',
      ctaExplore: 'Explore opportunities',
      ctaDeals: 'Nexus Deals',
      benefitsTitle: 'What we offer',
      jobsTitle: 'Thesis Projects',
      dealsTitle: 'Nexus Deals',
      dealsSubtitle:
        'Exclusive discounts and offers for Teknologkåren union members.',
      dealsBtn: 'See all deals',
      benefits: {
        learn: {
          title: 'Learn & Grow',
          description: 'Hands-on experience from leading tech companies in northern Sweden and beyond.',
        },
        career: {
          title: 'Kickstart Your Career',
          description: 'Land your dream job as a student through Nexus Portal and direct contacts.',
        },
        network: {
          title: 'Network',
          description: 'Build connections through career fairs, networking events and section activities.',
        },
      },
    },

    // --- Corporate page ---
    corporate: {
      badge: 'For Companies',
      heading: "Reach tomorrow's",
      headingAccent: 'engineers',
      description:
        'TKL Nexus helps you connect with LTU students through events, activities, job listings and student union benefits.',
      ctaContact: 'Contact us',
      ctaServices: 'See our services',
      servicesTitle: 'How we can help you',
      ctaBannerTitle: 'Ready to get started?',
      ctaBannerSubtitle: 'We will walk you through what a collaboration could look like.',
      ctaBannerBtn: 'Contact us',
      stats: {
        members: 'Active union members',
        programs: 'Unique degree programmes',
        sections: 'Different sections',
      },
      services: {
        events: {
          title: 'Events & Relations',
          description: 'Career fairs, company visits and networking where you meet active employers and students.',
          linkLabel: 'See upcoming events',
        },
        portal: {
          title: 'Nexus Portal',
          description: 'Post internships, thesis projects and positions to the right audience with clear contact paths.',
          linkLabel: 'Post a listing',
        },
        partnership: {
          title: 'Partnership',
          description: 'We help you get visibility online, on social media, on campus and through Nexus Deals.',
          linkLabel: 'Read about partnership',
        },
      },
    },

    // --- About page ---
    about: {
      badge: 'About Us',
      heading: 'We build',
      headingAccent: 'bridges',
      description:
        'TKL Nexus is the career project group of Teknologkåren, maintaining continuous industry contact to create value and improve student life for union members on campus.',
      ctaContact: 'Contact us',
      whatIsTitle: 'What is TKL Nexus?',
      contactTitle: 'Contact us',
      reachOutTitle: 'Reach out',
      timelineTitle: 'Our journey',
      whatIs: {
        p1: 'Our work includes Events & Relations, which supports operational work around events and company follow-up, Nexus Portal which today serves as a platform for thesis projects, and Nexus Deals where member benefits are collected in one place.',
        p2: 'For students, we help you find thesis projects through Nexus Portal, collect union benefits in Nexus Deals, and stay updated on current events and activities in the Ludd event calendar.',
        p3: 'For companies and partners seeking future engineers, or wanting to contribute to a more attractive student life, we offer collaborations through events, activities, advertising and offers to our union members.',
      },
      timeline: {
        founded: { title: 'TKL Nexus founded', desc: 'The career project group is established under Teknologkåren at LTU.' },
        firstEvent: { title: 'First career fair', desc: 'Nexus organises its first major event with over 20 companies on campus.' },
        portal: { title: 'Nexus Portal launched', desc: 'A digital platform for thesis projects and internships is made available to union members.' },
        deals: { title: 'Nexus Deals introduced', desc: 'Exclusive benefits and discounts collected for all union members.' },
        growth: { title: 'Platform grows', desc: 'Expanded features, more partners and a new digital presence.' },
      },
    },
  },
} as const;

export type Translations = typeof TRANSLATIONS.sv;
