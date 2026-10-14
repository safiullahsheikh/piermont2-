// Case studies shown in the home Projects section and at /work/[slug].
// `group` is the project's discipline label.
// `focus` is the CSS object-position used when the image is cropped on cards.

export type Project = {
  slug: string;
  client: string;
  service: string;
  category: string;
  group: string;
  image: string;
  width: number;
  height: number;
  alt: string;
  focus: string;
  /** Optional muted loop shown on cards instead of the still image. */
  video?: string;
  tagline: string;
  intro: string;
  sections: { title: string; body: string }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "augen-pro",
    client: "Augen Pro",
    service: "Digital Experience Concept",
    category: "AI Wearables / Deep Tech",
    group: "WEBSITE DESIGN",
    image: "/projects/augen.png",
    video: "/projects/augen.mp4",
    width: 1918,
    height: 819,
    alt: "Augen Pro website homepage with a profile portrait and the line Beyond Humanware",
    focus: "58% 50%",
    tagline: "Beyond Humanware.",
    intro:
      "Augen Pro combines AI, wearables and neural technology, a category that doesn’t yet have design conventions of its own. The challenge was communicating an ambitious, futuristic product vision without overwhelming visitors with technical complexity. This wasn’t simply a technology website. It was an attempt to define the digital interface for a new category of computing.",
    sections: [
      {
        title: "The Brief: Define A Category That Doesn’t Exist Yet",
        body: "Communicate the intelligence behind Augen Pro without making the technology feel complicated, so visitors think: I understand it, I want it, I want to experience it.",
      },
      {
        title: "Three Convictions Behind The Design",
        body: "We treated advanced technology as something that needed to feel simple, made the product feel tangible before anyone touched it, and made every interaction feel intentional rather than incidental.",
      },
      {
        title: "Mapping Five Moments Of Trust",
        body: "We mapped the relationship between the wearable, the AI system, the user, the surrounding environment, and the digital interface, identifying discovery, understanding, interaction, trust, and adoption as the moments needing the most clarity.",
      },
      {
        title: "Revealing The Product In Layers",
        body: "Instead of a spec sheet, the interface introduces AI capabilities, wearable interaction, environmental awareness, intelligent assistance, hardware, and real-world applications in progressive layers.",
      },
      {
        title: "Giving Technology Room To Breathe",
        body: "Big product images, simple type and plenty of space keep the focus on the hardware. Interactive details add depth without getting in the way.",
      },
      {
        title: "Motion That Earns Its Place",
        body: "Slow product reveals, spatial transitions, subtle parallax, interface morphing, and 3D product movement show how the product works. Nothing moves just for show.",
      },
      {
        title: "Testing Whether People Understood It",
        body: "Interactive prototypes evaluated comprehension speed, approachability, navigation between hardware and software, and whether motion enhanced or distracted from the product.",
      },
      {
        title: "Designing For Products That Don’t Exist Yet",
        body: "A flexible system was designed to expand around new hardware, AI capabilities, software updates, and interaction models, so it can keep growing with the product instead of being rebuilt every launch.",
      },
      {
        title: "Invisible Technology, Visible Possibility",
        body: "A site that makes a complicated wearable easy to understand, with the product shown up close and a design system ready to grow with new releases.",
      },
    ],
  },
  {
    slug: "blackline-auto",
    client: "Blackline Auto",
    service: "Website Design",
    category: "Independent Automotive Workshop",
    group: "WEBSITE DESIGN",
    image: "/projects/blackline.png",
    video: "/projects/blackline.mp4",
    width: 1890,
    height: 820,
    alt: "Blackline Auto website with the headline Find parts guaranteed to fit and an Add my vehicle form",
    focus: "4% 60%",
    tagline: "Findable, then trusted.",
    intro:
      "Blackline relied on repeat customers and word of mouth, but online searchers had no clear way to understand the services on offer.",
    sections: [
      {
        title: "The Brief: Close The Gap Word-Of-Mouth Left Open",
        body: "Turn uncertain local searches into confident enquiries and bookings.",
      },
      {
        title: "What We Prioritized",
        body: "We led with services and trust signals rather than brand story, made contact and booking pathways impossible to miss, and designed mobile-first, since most searches happen on the go.",
      },
      {
        title: "Mapping The Local Search Journey",
        body: "We mapped the local customer journey, from a frustrated search to a booked appointment, and found trust and clarity as the biggest gaps.",
      },
      {
        title: "Leading With Services, Not Story",
        body: "The site was organized around services first, with reviews and credentials placed to reinforce trust at each decision point.",
      },
      {
        title: "Designing For A Phone In A Parking Lot",
        body: "Prominent booking and enquiry pathways, mobile-first layouts, and clear service discovery reduced the steps between visit and enquiry.",
      },
      {
        title: "From Search To Booking",
        body: "A straightforward website designed to turn local searches into enquiries, built around service discovery, reviews, and quote requests.",
      },
    ],
  },
  {
    slug: "qatar-airways",
    client: "Qatar Airways",
    service: "Booking Experience Design",
    category: "Aviation / Travel",
    group: "UI/UX DESIGN",
    image: "/projects/qatar.png",
    video: "/projects/qatar.mp4",
    width: 1440,
    height: 900,
    alt: "Qatar Airways homepage with a longtail boat on turquoise water and a flight booking panel",
    focus: "50% 50%",
    tagline: "Planning a trip should feel like the start of it.",
    intro:
      "An airline homepage has two jobs. It has to sell the idea of travel and it has to let someone book a flight in seconds. Qatar Airways needed both on one screen without either one getting in the way.",
    sections: [
      {
        title: "The Brief: Inspire Without Slowing Anyone Down",
        body: "Keep the sense of place that makes people want to go, while putting the booking tools where returning travellers expect them.",
      },
      {
        title: "What We Prioritized",
        body: "The booking panel sits over the hero image from the first second, with tabs for booking, stopovers, managing a trip and flight status, so the most common tasks never need a menu.",
      },
      {
        title: "Mapping Real Booking Journeys",
        body: "We walked through return, one way and multi city trips, Avios bookings and promo codes, and trimmed each step until the whole form fit on a single row on desktop.",
      },
      {
        title: "Destinations Priced In Context",
        body: "Further down, destination cards show fares from the visitor’s home airport, turning casual browsing into a shortlist.",
      },
      {
        title: "Help Without Leaving The Page",
        body: "An assistant stays within reach in the corner, so questions about baggage or changes don’t pull people away halfway through a booking.",
      },
      {
        title: "A Homepage That Books",
        body: "An airline homepage that feels like travel and works like a booking tool, with inspiration and utility sharing the same space.",
      },
    ],
  },
  {
    slug: "oak-and-ember",
    client: "Oak & Ember",
    service: "Website Design",
    category: "Restaurant",
    group: "UI/UX DESIGN",
    image: "/projects/oakandember.png",
    video: "/projects/oakandember.mp4",
    width: 1894,
    height: 816,
    alt: "Oak & Ember website with the headline Your favourite drink wherever you go over a lifestyle photo",
    focus: "6% 62%",
    tagline: "Atmosphere first.",
    intro:
      "Oak & Ember’s identity was strong offline but wasn’t being communicated digitally.",
    sections: [
      {
        title: "The Brief: Make The Screen Feel Like The Room",
        body: "Make visitors feel the restaurant’s atmosphere before they ever step inside.",
      },
      {
        title: "What We Prioritized",
        body: "We let food and space photography set the tone immediately, kept the menu and booking flow simple, and designed for mobile, where most diners actually browse.",
      },
      {
        title: "Identifying The Sensory Cues",
        body: "We identified the sensory cues, light, texture, and plating, that defined the restaurant’s in-person atmosphere, and looked for ways to translate them digitally.",
      },
      {
        title: "Building The Site Atmosphere-First",
        body: "The site was built atmospherically first and functionally second: photography set the mood before the menu or reservation system appeared.",
      },
      {
        title: "Weaving Function Into The Story",
        body: "The menu, directions and bookings sit inside the same photo led pages instead of feeling like separate admin pages. Slow, warm transitions match the pace of a dinner service.",
      },
      {
        title: "Feeling The Restaurant Before Arriving",
        body: "A website that gives people a feel for the restaurant before they arrive and makes booking a table quick.",
      },
    ],
  },
  {
    slug: "pantry",
    client: "Pantry",
    service: "Mobile Product Design",
    category: "Meal & Grocery App",
    group: "PRODUCT DEVELOPMENT",
    image: "/projects/pantry.png",
    width: 328,
    height: 705,
    alt: "Pantry mobile app home screen showing Pantry Health, recipes you can make now, and a grocery list",
    focus: "50% 18%",
    tagline: "Start from what’s already there.",
    intro:
      "People often decide what to cook only after realizing they don’t have the ingredients.",
    sections: [
      {
        title: "The Brief: Flip The Usual Order",
        body: "Connect what’s already at home to what to cook next, reducing waste and unnecessary shopping.",
      },
      {
        title: "What We Prioritized",
        body: "We started from the user’s existing inventory rather than a recipe search, automatically surfaced what’s missing rather than requiring manual lists, and made smart suggestions feel helpful rather than prescriptive.",
      },
      {
        title: "Mapping The Everyday Disconnect",
        body: "We mapped the everyday disconnect between what’s in the kitchen and what recipes assume is available, and designed the flow to close that gap.",
      },
      {
        title: "Starting From Inventory, Not Recipes",
        body: "The story centered on inventory-first planning, with recipes suggested based on what a user already had rather than the other way around.",
      },
      {
        title: "Automating What Was Manual",
        body: "Recipe discovery and grocery-list generation were connected directly to the inventory system, with a warm, kitchen-inspired visual language keeping the utility feeling approachable rather than clinical.",
      },
      {
        title: "A Kitchen That Plans With You",
        body: "A food planning app that starts with what is in your kitchen, suggests what to cook and cuts down on waste and extra shopping.",
      },
    ],
  },
  {
    slug: "raycast",
    client: "Raycast",
    service: "Web Design & UX",
    category: "Productivity / Software",
    group: "WEBSITE DESIGN",
    image: "/projects/raycast.png",
    video: "/projects/raycast.mp4",
    width: 1888,
    height: 823,
    alt: "Raycast website with the headline Your shortcut to everything over red diagonal light streaks",
    focus: "50% 62%",
    tagline: "Too much to show, not too little.",
    intro:
      "Raycast’s challenge was almost the opposite of most software sites. A large library of commands and extensions risked burying the thing that actually sells the product, which is how fast it is to use.",
    sections: [
      {
        title: "The Brief: Make Vast Feel Simple",
        body: "Present a large, extensible ecosystem without making the product feel complicated.",
      },
      {
        title: "What Guided Every Decision",
        body: "We let individual capabilities speak for themselves rather than compressing them into one dense page. A consistent visual system tied the ecosystem together without flattening the personality of individual extensions. The software itself, not the marketing around it, stayed at the center.",
      },
      {
        title: "Cataloguing A Sprawling Toolkit",
        body: "We catalogued Raycast’s core commands, extensions, and workflows, then traced the path a new user follows from first impression to daily habit.",
      },
      {
        title: "Letting Commands Speak For Themselves",
        body: "The site was structured as modular capability blocks, each demonstrating one workflow so the ecosystem never felt overwhelming.",
      },
      {
        title: "Designing For Developers",
        body: "A developer-focused visual language, monospace accents, crisp command palettes, and clear calls to action kept the interface fast to scan.",
      },
      {
        title: "Speed As A Visual Language",
        body: "Quick, unfussy transitions echoed Raycast’s own keyboard-driven speed.",
      },
      {
        title: "A Catalog, Not A Pitch",
        body: "A site that lets people find the commands they need quickly and lets the product sell itself.",
      },
    ],
  },
  {
    slug: "resend",
    client: "Resend",
    service: "Brand Experience / Web Design",
    category: "Developer Infrastructure",
    group: "PRODUCT DEVELOPMENT",
    image: "/projects/resend.png",
    video: "/projects/resend.mp4",
    width: 1890,
    height: 819,
    alt: "Resend website with the serif headline Email for developers beside a dark 3D cube",
    focus: "24% 55%",
    tagline: "Infrastructure for two audiences at once.",
    intro:
      "Developer infrastructure is hard to explain to non-technical decision makers. Resend needed a site that spoke fluently to engineers while still making the case to the people who approve the budget.",
    sections: [
      {
        title: "The Brief: Earn Trust Before Asking For Commitment",
        body: "Translate complex email infrastructure into something both developers and business buyers could understand.",
      },
      {
        title: "Principles That Shaped The Build",
        body: "We prioritized understanding before adoption. Concise messaging was paired with real product interfaces and code, not abstract illustration, and documentation-driven navigation kept technical information easy to find.",
      },
      {
        title: "Mapping Two Very Different Readers",
        body: "We mapped Resend’s API, dashboard, and delivery infrastructure against the two audiences who needed to trust it: engineers and the people signing off on tools.",
      },
      {
        title: "Pairing Prose With Proof",
        body: "Technical functionality was broken into simple sections, each pairing plain-language explanation with the interface or code it described.",
      },
      {
        title: "Documentation As Navigation",
        body: "Documentation-driven navigation let technical visitors jump straight to implementation, while conversion-focused landing pages guided everyone else toward the value proposition.",
      },
      {
        title: "Restraint As A Design Choice",
        body: "Restrained motion favored clarity over spectacle, appropriate for an audience that values signal over noise.",
      },
      {
        title: "Understanding First, Adoption Second",
        body: "A clearer site that explains the product first, and works for engineers and budget holders alike.",
      },
    ],
  },
  {
    slug: "rise",
    client: "Rise",
    service: "Mobile UX Concept",
    category: "Sleep / Wellness",
    group: "UI/UX DESIGN",
    image: "/projects/rise.png",
    video: "/projects/rise.mp4",
    width: 835,
    height: 712,
    alt: "Rise app screens: a calendar card and a phone showing a time off request review",
    focus: "72% 50%",
    tagline: "Say less, mean more.",
    intro:
      "Sleep data is easy to collect and hard to make meaningful. Rise needed an experience that turned charts and statistics into something a tired user could actually absorb in seconds.",
    sections: [
      {
        title: "The Brief: Turn Data Into Rest",
        body: "Turn complex sleep data into a small number of insights a user can understand without effort.",
      },
      {
        title: "What Shaped The Design",
        body: "We prioritized a simple daily overview over exhaustive data, translated metrics into a small number of actionable insights, and favored calm interaction patterns appropriate to a wellness context.",
      },
      {
        title: "Finding The Few Numbers That Matter",
        body: "We reviewed the full range of sleep metrics Rise could surface, then identified which few actually change a user’s behavior the next day.",
      },
      {
        title: "Building Around One Summary",
        body: "The experience was restructured around a single daily summary, with deeper data available but never required.",
      },
      {
        title: "Softness As A Design Principle",
        body: "Soft data visualization and personalized insight cards replaced dense charts, keeping the tone calm rather than clinical.",
      },
      {
        title: "A Simpler Way To Wake Up",
        body: "Slow, gentle transitions suit a wellness app. The result is a simple daily view of how you slept, with personal tips instead of raw charts.",
      },
    ],
  },
  {
    slug: "splitly",
    client: "Splitly",
    service: "Mobile Product Design",
    category: "Expense Splitting App",
    group: "PRODUCT DEVELOPMENT",
    image: "/projects/splitly.png",
    video: "/projects/splitly.mp4",
    width: 1896,
    height: 825,
    alt: "Splitly turning a paper receipt into a shared expense, with each item assigned to friends in the app",
    focus: "64% 50%",
    tagline: "Three steps, then done.",
    intro:
      "Splitting a restaurant bill or group expense often means calculating amounts manually or sending multiple messages.",
    sections: [
      {
        title: "The Brief: Make The Math Disappear",
        body: "Turn a socially awkward task into a fast, three-step utility.",
      },
      {
        title: "What We Prioritized",
        body: "We reduced the entire process to create, add, and settle, prioritized speed over configurability, and designed onboarding simple enough to skip entirely.",
      },
      {
        title: "Breaking Down The Smallest Steps",
        body: "We broke down the group-expense process into its smallest necessary steps, cutting anything that added friction to settling up.",
      },
      {
        title: "Designing Onboarding You Can Skip",
        body: "The narrative centered on speed and simplicity, group, add, settle, rather than financial features or complexity, with onboarding simple enough that most people never actually need it.",
      },
      {
        title: "Choosing Speed Over Flexibility",
        body: "A lightweight settlement flow let a group be created and settled in under a minute, with quick, satisfying micro-interactions reinforcing the feeling of a task being resolved instantly.",
      },
      {
        title: "A Process That Gets Out Of The Way",
        body: "A small, fast app for splitting costs with friends. Set up a group, add what was spent and settle up.",
      },
    ],
  },
  {
    slug: "stoic",
    client: "Stoic",
    service: "Mobile Product Design",
    category: "Journaling / Wellness",
    group: "PRODUCT DEVELOPMENT",
    image: "/projects/stoic.png",
    video: "/projects/stoic.mp4",
    width: 532,
    height: 673,
    alt: "Stoic journaling app showing a Feeling good day entry and a gratitude reflection, beside a padlock icon",
    focus: "30% 30%",
    tagline: "Past the blank page.",
    intro:
      "Journaling apps often fail for the same reason paper journals do: the blank page is intimidating. Stoic needed daily reflection to feel like a quiet ritual, not a chore.",
    sections: [
      {
        title: "The Brief: Make Reflection Easy",
        body: "Encourage consistent reflection without turning journaling into a complicated routine.",
      },
      {
        title: "What Guided The Design",
        body: "We replaced the blank page with guided prompts, built daily rituals that reduce decision fatigue, and made progress visible without gamifying reflection.",
      },
      {
        title: "Understanding Why Habits Break",
        body: "We looked at why journaling habits break down, usually at the moment of not knowing what to write, and designed around removing that friction.",
      },
      {
        title: "Replacing The Blank Page",
        body: "Guided prompts and short daily rituals replaced the open-ended blank page, lowering the barrier to a single entry.",
      },
      {
        title: "Giving Entries Weight",
        body: "An editorial UI gave entries a sense of permanence and craft, rather than feeling like disposable notes. Micro-interactions marked streaks and progress subtly, without turning reflection into a competitive habit tracker.",
      },
      {
        title: "A Calmer Daily Ritual",
        body: "A calm journaling app where guided prompts make it easy to write something every day, and progress shows up quietly.",
      },
    ],
  },
  {
    slug: "boeing",
    client: "Boeing",
    service: "Corporate Website Design",
    category: "Aerospace & Defense",
    group: "WEBSITE DESIGN",
    image: "/projects/boeing.png",
    video: "/projects/boeing.mp4",
    width: 1440,
    height: 900,
    alt: "Boeing website homepage with a 737 in flight over a snowy mountain and the line Connect, protect and explore our world and beyond",
    focus: "50% 50%",
    tagline: "One company, many audiences.",
    intro:
      "Boeing speaks to airlines, governments, investors, suppliers, job seekers and the public, often in the same visit. The site had to carry commercial aircraft, defense, space and services without any one of them drowning out the rest.",
    sections: [
      {
        title: "The Brief: Give Every Audience A Clear Door",
        body: "Let each visitor reach their part of Boeing within a click or two, while keeping safety and quality information close at hand for everyone.",
      },
      {
        title: "What We Prioritized",
        body: "We put the business units in the main navigation, moved investor, supplier and newsroom links into a quieter utility bar, and treated safety as a top level destination rather than a footer link.",
      },
      {
        title: "Letting The Aircraft Lead",
        body: "Full width film and photography of real aircraft opens the site, with short, plain headlines laid over it. The product does the persuading.",
      },
      {
        title: "Organizing A Huge Catalogue",
        body: "Featured products sit in a simple row of cards that works the same for a 787 Dreamliner as it does for a satellite, so the pattern holds as the portfolio changes.",
      },
      {
        title: "Built For Access And Scale",
        body: "Strong contrast, keyboard friendly navigation and a component set the internal team can extend across regional and program pages.",
      },
      {
        title: "A Front Door Worthy Of The Fleet",
        body: "A corporate site that reads calmly despite its size, routes each audience quickly to what they came for, and keeps the aircraft at the center of the story.",
      },
    ],
  },
  {
    slug: "refero-styles",
    client: "Refero Styles",
    service: "Website & Product Design",
    category: "Design Tools / AI",
    group: "WEBSITE DESIGN",
    image: "/projects/refero.png",
    video: "/projects/refero.mp4",
    width: 1440,
    height: 900,
    alt: "Refero Styles homepage with a large serif headline, a search bar for design systems and a grid of trending website styles",
    focus: "50% 50%",
    tagline: "A library that designers and AI can both read.",
    intro:
      "Refero Styles turns the design systems of real product websites into files that people and AI coding tools can use. The site needed to feel like a design library first and a developer tool second, without losing either audience.",
    sections: [
      {
        title: "The Brief: Make Two Thousand Styles Browsable",
        body: "Help people find a style by feeling, like trustworthy fintech or retro web nostalgia, and leave with colors, type and spacing they can actually use.",
      },
      {
        title: "What We Prioritized",
        body: "Search sits at the center of the page. Suggested prompts underneath teach people how to search without a tutorial, and every result opens straight into a usable style.",
      },
      {
        title: "A Quiet Frame For Loud Work",
        body: "The interface stays white, grey and typographic so the thousands of sites inside it can carry all the color.",
      },
      {
        title: "Cards That Preview The Real Thing",
        body: "Each style card shows a snapshot of the source site, grouped into trending, popular and newest so returning visitors always find something new.",
      },
      {
        title: "Designed For People And Machines",
        body: "Every style page pairs a visual breakdown with a DESIGN.md file ready for Cursor, Claude Code, Codex, v0 or Lovable.",
      },
      {
        title: "From Inspiration To Implementation",
        body: "A reference library where browsing for ideas and exporting a working design system happen in the same few clicks.",
      },
    ],
  },
  {
    slug: "rarible",
    client: "Rarible",
    service: "Marketplace UX Design",
    category: "Web3 / NFT Marketplace",
    group: "UI/UX DESIGN",
    image: "/projects/rarible.png",
    video: "/projects/rarible.mp4",
    width: 1440,
    height: 900,
    alt: "Rarible marketplace homepage with chain filters, featured collection banners and a row of NFT collections",
    focus: "50% 50%",
    tagline: "Trading at the speed of the market.",
    intro:
      "NFT collectors move fast and compare constantly. Rarible trades across several chains, and the interface had to show what is moving right now without burying people in data.",
    sections: [
      {
        title: "The Brief: One Marketplace, Many Chains",
        body: "Let people switch between Ethereum, Solana and newer chains without feeling like they had left the product.",
      },
      {
        title: "What We Prioritized",
        body: "Chain filters sit directly under the search bar, collections lead with artwork rather than tables, and live prices stay pinned to the footer.",
      },
      {
        title: "Designing For Scanning",
        body: "Featured drops open the page as large banners, followed by a scrolling row of collections and a trending table with time filters from one hour to thirty days.",
      },
      {
        title: "A Voice Built For Traders",
        body: "A monospaced typeface and a high contrast dark theme give the product a trading desk feel that suits people who check it many times a day.",
      },
      {
        title: "Built For Collectors Who Check Daily",
        body: "A marketplace that surfaces what matters at a glance and keeps every chain one tap away.",
      },
    ],
  },
  {
    slug: "gamma",
    client: "Gamma",
    service: "Product Marketing & UX",
    category: "AI / Presentation Software",
    group: "UI/UX DESIGN",
    image: "/projects/gamma.png",
    video: "/projects/gamma.mp4",
    width: 1440,
    height: 900,
    alt: "Gamma homepage with the headline Effortless AI design for presentations, websites, and more beside a column of example pages",
    focus: "50% 50%",
    tagline: "Show the product making things.",
    intro:
      "Gamma makes presentations, websites and social posts with AI. People arriving for the first time needed to see what it produces before reading a word about how it works.",
    sections: [
      {
        title: "The Brief: Explain AI Without Talking About AI",
        body: "Show the output, not the model. Visitors should see a finished deck or site within seconds of landing.",
      },
      {
        title: "What We Prioritized",
        body: "A short headline and one clear call to action on the left, with a moving column of real pages made in Gamma on the right.",
      },
      {
        title: "Showing Editing In Action",
        body: "Small interface moments, like an Improve writing prompt, appear over the examples so the editing experience is visible without a demo video.",
      },
      {
        title: "One Page For Many Uses",
        body: "Presentations, websites, documents and social posts each get their own section with matching work, so every visitor finds their own use case.",
      },
      {
        title: "Friendly, Tactile Visuals",
        body: "Soft illustrated imagery and rounded shapes keep a technical product approachable for teachers, founders and marketers alike.",
      },
      {
        title: "Seeing Is Understanding",
        body: "A product story that lets people see what they could make, and start making it, within their first scroll.",
      },
    ],
  },
  {
    slug: "box-box-club",
    client: "Box Box Club",
    service: "Brand Identity & Website",
    category: "Formula 1 / Sports App",
    group: "BRANDING",
    image: "/projects/boxbox.png",
    video: "/projects/boxbox.mp4",
    width: 1440,
    height: 900,
    alt: "Box Box Club website with a red and white branded Formula 1 car and app store buttons",
    focus: "50% 50%",
    tagline: "Pit wall energy for everyday fans.",
    intro:
      "Box Box Club builds Formula 1 widgets and an app for fans who follow every session. The brand needed the speed and noise of race weekend while still looking like a product people trust on their home screen.",
    sections: [
      {
        title: "The Brief: Feel Like Race Day",
        body: "Create an identity that belongs next to the sport without borrowing its official look.",
      },
      {
        title: "What We Prioritized",
        body: "A bold, wide logotype, a red and white color system inspired by team liveries, and a race car wrapped in the brand as the hero image.",
      },
      {
        title: "Taking The Name Literally",
        body: "Box box is the radio call to pit. We carried that into the brackets that frame the tagline and the stats, like messages from the pit wall.",
      },
      {
        title: "Community In Plain Sight",
        body: "Users, countries, languages, ratings and reviews sit right on the hero next to Discord, X, Instagram and Threads, because the audience is the proof.",
      },
      {
        title: "A System That Travels",
        body: "The identity works across app icons, widgets, social posts and merchandise, keeping the same type and color wherever fans meet it.",
      },
      {
        title: "A Brand Built Like A Livery",
        body: "An identity that feels at home on race weekend and on a phone screen, with the car, the call and the community all telling the same story.",
      },
    ],
  },
  {
    slug: "stardust",
    client: "Stardust",
    service: "Brand Identity & Web Experience",
    category: "Women’s Health / Cycle Tracking",
    group: "BRANDING",
    image: "/projects/stardust.png",
    video: "/projects/stardust.mp4",
    width: 1440,
    height: 900,
    alt: "Stardust website with colorful planets floating around an app screen on a deep purple night sky",
    focus: "50% 50%",
    tagline: "Body literacy, written in the stars.",
    intro:
      "Stardust helps people understand their hormonal health. Period tracking apps often look clinical or overly cute. Stardust wanted something warmer and more curious.",
    sections: [
      {
        title: "The Brief: Make Hormonal Health Feel Like Discovery",
        body: "Give people a reason to explore their cycle rather than just log it.",
      },
      {
        title: "What We Prioritized",
        body: "We built the identity around space: a deep purple night sky, a soft cream for type, and planets that stand in for the phases of the cycle.",
      },
      {
        title: "An Interactive Galaxy",
        body: "The site opens as a galaxy you enter. Each planet leads to a part of the app, so learning about the product feels like exploring rather than reading.",
      },
      {
        title: "Type With Personality",
        body: "An elegant serif with flared strokes carries the wordmark and headlines, keeping the brand intimate and a little mystical.",
      },
      {
        title: "Carrying It Into The App",
        body: "The same colors, planets and tone run through the app screens, so the website and the product feel like one world.",
      },
      {
        title: "A Universe People Want To Enter",
        body: "A brand that turns a sensitive subject into something curious and welcoming, with a web experience that invites people in.",
      },
    ],
  },
  {
    slug: "luma",
    client: "Luma",
    service: "Brand & Marketing Site",
    category: "Events Platform",
    group: "BRANDING",
    image: "/projects/luma.png",
    video: "/projects/luma.mp4",
    width: 1440,
    height: 900,
    alt: "Luma homepage with the headline Delightful events start here surrounded by floating event invite cards",
    focus: "50% 50%",
    tagline: "Every event deserves a great invite.",
    intro:
      "Luma hosts everything from run clubs to hackathons. The brand had to feel as fun as the events people create with it while staying simple enough for anyone to start one.",
    sections: [
      {
        title: "The Brief: Let The Events Be The Brand",
        body: "Show the range of events people host rather than listing features.",
      },
      {
        title: "What We Prioritized",
        body: "A short headline, one button to create an event, and a softer link to discover events. Everything else on the first screen is invites.",
      },
      {
        title: "A Wall Of Real Invites",
        body: "Event covers float around the headline in cards with gentle depth, each in its own style, from a BBQ poster to a Paris AI hackathon.",
      },
      {
        title: "Color With Restraint",
        body: "The interface stays white and quiet, with a single warm gradient on the headline, so the invites carry the color.",
      },
      {
        title: "Fun Before Sign Up",
        body: "A brand presence that makes hosting feel easy and fun, and gets people creating their first event from the very first screen.",
      },
    ],
  },
  {
    slug: "the-getaway",
    client: "The Getaway",
    service: "Social Ad Film",
    category: "Beverage / Vertical Video",
    group: "PERFORMANCE MARKETING",
    image: "/projects/marketing1.png",
    video: "/projects/marketing1.mp4",
    width: 720,
    height: 1280,
    alt: "A man in a green beret smashes a car window to grab a bottle, then runs down the street with police behind him",
    focus: "50% 50%",
    tagline: "Worth breaking in for.",
    intro:
      "A drinks brand wanted a short ad that people would watch to the end on their phones instead of swiping past.",
    sections: [
      {
        title: "The Idea",
        body: "Make the bottle the thing everyone wants. A glass smash in the first second earns attention, and a chase through the street keeps it.",
      },
      {
        title: "How We Shot It",
        body: "Vertical from the start, tight framing inside the car, and a handheld chase so it feels caught on the spot rather than staged.",
      },
      {
        title: "The Result",
        body: "A ten second story with the product in frame the whole way through, cut for Reels, TikTok and Shorts.",
      },
    ],
  },
  {
    slug: "grocery-run",
    client: "Grocery Run",
    service: "Social Ad Film",
    category: "Food & Retail / Vertical Video",
    group: "PERFORMANCE MARKETING",
    image: "/projects/marketing2.png",
    video: "/projects/marketing2.mp4",
    width: 720,
    height: 1280,
    alt: "A woman in a varsity jacket and red skirt unpacks groceries in a loading bay as a delivery van pulls in",
    focus: "50% 50%",
    tagline: "Everyday shopping with a little attitude.",
    intro:
      "A retail campaign needed to make something ordinary, a bag of groceries, feel worth stopping for.",
    sections: [
      {
        title: "The Idea",
        body: "Style the grocery run like a fashion shoot. Bold wardrobe, a loading bay backdrop and the products laid out like props.",
      },
      {
        title: "How We Shot It",
        body: "A locked off frame keeps the products readable while the van and small movements add life without clutter.",
      },
      {
        title: "The Result",
        body: "A short loop that shows the range at a glance and fits naturally into a feed full of fashion content.",
      },
    ],
  },
  {
    slug: "golden-hour",
    client: "Golden Hour",
    service: "Campaign Film",
    category: "Fashion & Accessories",
    group: "PERFORMANCE MARKETING",
    image: "/projects/marketing3.png",
    video: "/projects/marketing3.mp4",
    width: 1280,
    height: 960,
    alt: "Two models in black against a warm gold backdrop, one holding a black handbag",
    focus: "50% 50%",
    tagline: "Quiet luxury, in motion.",
    intro:
      "A fashion label wanted a campaign film that felt like a magazine spread and still worked as a paid social ad.",
    sections: [
      {
        title: "The Idea",
        body: "Warm gold light, black wardrobe and slow close ups. Let texture and the bag do the talking.",
      },
      {
        title: "How We Cut It",
        body: "Layered frames move between faces and product, so every cut shows the piece from a new angle.",
      },
      {
        title: "The Result",
        body: "An eight second film that runs as a hero ad, a story placement and a product page loop from the same edit.",
      },
    ],
  },
  {
    slug: "crosswalk",
    client: "Crosswalk",
    service: "Social Ad Film",
    category: "Fashion / Lifestyle",
    group: "PERFORMANCE MARKETING",
    image: "/projects/marketing4.png",
    video: "/projects/marketing4.mp4",
    width: 960,
    height: 1280,
    alt: "A woman in a varsity jacket holding two coffees crosses a stylized black and white crosswalk",
    focus: "50% 50%",
    tagline: "Morning rush, styled.",
    intro:
      "A lifestyle brand wanted a playful ad built around a daily moment their customers recognize.",
    sections: [
      {
        title: "The Idea",
        body: "A coffee run across a graphic crosswalk, with small surprises falling into frame to keep people watching.",
      },
      {
        title: "How We Shot It",
        body: "A clean white set and a top down angle turn the street into a graphic that reads instantly on a small screen.",
      },
      {
        title: "The Result",
        body: "A loopable seven second spot that works as an ad, a story and a pinned post.",
      },
    ],
  },
  {
    slug: "murder-of-crows",
    client: "Murder Of Crows",
    service: "Fashion Film Edit",
    category: "Fashion / Editorial",
    group: "VIDEO EDITING",
    image: "/projects/videdit1.png",
    video: "/projects/videdit1.mp4",
    width: 958,
    height: 1280,
    alt: "A model in black surrounded by a flock of crows, followed by street scenes of women in bold outfits",
    focus: "50% 50%",
    tagline: "Dark, dramatic, unforgettable.",
    intro:
      "An editorial fashion piece needed an edit that matched the drama of the styling.",
    sections: [
      {
        title: "The Edit",
        body: "We built the pace around the birds. Fast wing beats set the rhythm and each cut lands on a new look.",
      },
      {
        title: "Color And Mood",
        body: "Cold shadows for the studio frames, warm stone and sunlight for the street, so the story moves from dark to bold.",
      },
      {
        title: "The Result",
        body: "A ten second film that feels like a runway show compressed into a single scroll.",
      },
    ],
  },
  {
    slug: "city-eyes",
    client: "City Eyes",
    service: "Beauty Film Edit",
    category: "Beauty / Lifestyle",
    group: "VIDEO EDITING",
    image: "/projects/videdit2.png",
    video: "/projects/videdit2.mp4",
    width: 1280,
    height: 720,
    alt: "A woman on a sunny city street, then an extreme close up of her eye zooming into the iris",
    focus: "50% 50%",
    tagline: "From the street to the iris.",
    intro:
      "A beauty piece needed one moment that makes people stop and look closer.",
    sections: [
      {
        title: "The Edit",
        body: "A smooth push from a wide street shot all the way into the eye, hiding the join between cameras so it feels like one move.",
      },
      {
        title: "Color And Mood",
        body: "Warm summer grading keeps the skin tones natural and lets the iris detail glow.",
      },
      {
        title: "The Result",
        body: "A seven second transition piece built to open a campaign or loop on its own.",
      },
    ],
  },
  {
    slug: "giant-steps",
    client: "Giant Steps",
    service: "VFX Edit",
    category: "Streetwear / CGI",
    group: "VIDEO EDITING",
    image: "/projects/videdit3.png",
    video: "/projects/videdit3.mp4",
    width: 834,
    height: 1112,
    alt: "A giant model in a blue tee and leopard shorts stands among New York skyscrapers",
    focus: "50% 50%",
    tagline: "Bigger than the city.",
    intro:
      "A streetwear drop wanted a piece of content that looked impossible and still felt real.",
    sections: [
      {
        title: "The Edit",
        body: "We composited the model into live New York street footage, matching the light, lens and camera shake so the scale holds up.",
      },
      {
        title: "Selling The Shot",
        body: "A cut to a view from inside a car gives the audience a second angle, which makes the giant feel physically there.",
      },
      {
        title: "The Result",
        body: "A ten second clip made to be shared, with the outfit readable in every frame.",
      },
    ],
  },
  {
    slug: "times-square-switch",
    client: "Times Square Switch",
    service: "Mixed Media Edit",
    category: "Animation / Live Action",
    group: "VIDEO EDITING",
    image: "/projects/videdit4.png",
    video: "/projects/videdit4.mp4",
    width: 720,
    height: 1280,
    alt: "An animated character walks across a Times Square crosswalk and turns into a real person mid step",
    focus: "50% 50%",
    tagline: "Cartoon to real, in one step.",
    intro:
      "The brief was a short piece that blends animation and live footage in a way people want to rewatch.",
    sections: [
      {
        title: "The Edit",
        body: "An animated character crosses the street in real Times Square footage and switches into a live actor mid stride.",
      },
      {
        title: "Hiding The Switch",
        body: "Matching the pose, the timing of the step and the light on both versions keeps the switch clean on the first watch.",
      },
      {
        title: "The Result",
        body: "A six second loop with a clear moment of surprise, built for vertical feeds.",
      },
    ],
  },
];

// Category pages at /case-studies/[slug]. `group` matches Project.group.
export const CATEGORIES = [
  { slug: "website-design", group: "WEBSITE DESIGN", title: "Website Design" },
  { slug: "ui-ux-design", group: "UI/UX DESIGN", title: "UI/UX Design" },
  { slug: "product-development", group: "PRODUCT DEVELOPMENT", title: "Product Development" },
  { slug: "branding", group: "BRANDING", title: "Branding" },
  { slug: "digital-marketing", group: "PERFORMANCE MARKETING", title: "Digital Marketing" },
  { slug: "video-editing", group: "VIDEO EDITING", title: "Video Editing" },
];

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}
