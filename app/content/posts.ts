import { getProject } from "./projects.ts";

export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  /** Case study the post is written from; its video and poster illustrate the post. */
  project: string;
  body: { heading: string; text: string }[];
};

export const POSTS: Post[] = [
  {
    slug: "booking-forms-that-feel-like-travel",
    title: "What an airline homepage taught us about booking forms",
    category: "UI/UX Design",
    date: "Sep 18, 2026",
    readTime: "5 min read",
    excerpt:
      "Qatar Airways needed a homepage that sells the trip and books the flight on the same screen. Here is how we got the whole search onto a single row.",
    project: "qatar-airways",
    body: [
      {
        heading: "Two jobs, one screen",
        text: "An airline homepage has to make people want to go somewhere and then let them book it in seconds. Most sites pick one. We started the Qatar Airways work by refusing to choose, and by treating the booking panel as part of the hero rather than something that sits below it.",
      },
      {
        heading: "Walk every journey first",
        text: "Before drawing anything we went through return trips, one way trips, multi city routes, Avios bookings and promo codes. Every field that only mattered to one of those journeys moved behind a toggle. What was left fit on a single row on desktop, which meant a returning traveller never needs to open a menu.",
      },
      {
        heading: "Prices that start from home",
        text: "Destination cards further down the page show fares from the visitor's own airport. It is a small change, but it turns browsing into a shortlist, and a shortlist is much closer to a booking.",
      },
      {
        heading: "What we would tell any product team",
        text: "Put the most common task where people already look, cut every field that does not serve most journeys, and let the inspiration live around it instead of in front of it.",
      },
    ],
  },
  {
    slug: "a-library-people-and-ai-can-read",
    title: "Designing a library that designers and AI can both read",
    category: "Website Design",
    date: "Sep 4, 2026",
    readTime: "4 min read",
    excerpt:
      "Refero Styles holds thousands of real design systems. The interface had to get out of their way and still hand developers something they can ship.",
    project: "refero-styles",
    body: [
      {
        heading: "A quiet frame for loud work",
        text: "When the content is thousands of colorful websites, the interface around it should say very little. We kept Refero Styles white, grey and typographic so every style card carries its own color.",
      },
      {
        heading: "Teach search without a tutorial",
        text: "People rarely know the name of the style they want. They know the feeling, like trustworthy fintech or retro web nostalgia. Suggested prompts under the search bar show that you can search that way, and nobody has to read a help page to learn it.",
      },
      {
        heading: "Two readers for every page",
        text: "Each style page pairs a visual breakdown for designers with a DESIGN.md file ready for Cursor, Claude Code, Codex, v0 or Lovable. Designing for a machine reader turned out to make the human version clearer too, because every value had to be named and explained.",
      },
    ],
  },
  {
    slug: "a-brand-built-like-a-livery",
    title: "Building a brand that feels like race day",
    category: "Branding",
    date: "Aug 21, 2026",
    readTime: "4 min read",
    excerpt:
      "Box Box Club makes Formula 1 widgets for fans who follow every session. We gave it pit wall energy without borrowing the sport's official look.",
    project: "box-box-club",
    body: [
      {
        heading: "Start with the name",
        text: "Box box is the radio call that tells a driver to pit. We took that literally. The brackets around the tagline and the stats read like messages from the pit wall, and they give the whole system a voice fans recognize straight away.",
      },
      {
        heading: "Color from the grid",
        text: "A red and white palette drawn from team liveries, a wide and heavy logotype, and a race car wrapped in the brand as the hero image. It feels like the sport while staying clearly its own thing.",
      },
      {
        heading: "Let the community do the talking",
        text: "Users, countries, languages and ratings sit right on the hero next to Discord, X, Instagram and Threads. For a fan product, the size of the crowd is the strongest proof there is.",
      },
    ],
  },
  {
    slug: "let-the-aircraft-lead",
    title: "One company, many audiences: notes from the Boeing site",
    category: "Website Design",
    date: "Aug 7, 2026",
    readTime: "5 min read",
    excerpt:
      "Airlines, governments, investors, suppliers and job seekers all land on the same homepage. Here is how we gave each of them a clear door.",
    project: "boeing",
    body: [
      {
        heading: "Sort the doors before the rooms",
        text: "Boeing's visitors want very different things. We put the business units in the main navigation, moved investor, supplier and newsroom links into a quieter utility bar, and made safety a top level destination instead of a footer link.",
      },
      {
        heading: "The product persuades",
        text: "Full width film of real aircraft opens the site, with short and plain headlines over it. When the product is a 787, the best thing a layout can do is give it room.",
      },
      {
        heading: "Patterns that survive change",
        text: "Featured products sit in a simple row of cards that works the same for an airliner as for a satellite. When the portfolio changes, the pattern holds and the internal team can extend it without us.",
      },
    ],
  },
  {
    slug: "ten-seconds-to-earn-a-watch",
    title: "Ten seconds to earn a watch: notes on vertical ad films",
    category: "Digital Marketing",
    date: "Jul 24, 2026",
    readTime: "3 min read",
    excerpt:
      "A glass smash in the first second, a chase to keep it going, and the bottle in frame the whole time. What we learned making ads people finish.",
    project: "the-getaway",
    body: [
      {
        heading: "The first second is the brief",
        text: "On a phone, nobody owes an ad their attention. For The Getaway we opened on a car window breaking, because a sound and a movement like that earns the next few seconds on its own.",
      },
      {
        heading: "Shoot vertical from the start",
        text: "Cropping a wide film for Reels always shows. We framed tight inside the car and shot the chase handheld, so it feels caught on the spot rather than staged.",
      },
      {
        heading: "Keep the product in every frame",
        text: "The bottle is the reason for the chase, so it never leaves the shot. If someone swipes away at second four, they have still seen what we were selling.",
      },
    ],
  },
  {
    slug: "hiding-the-cut",
    title: "Hiding the cut: edits people want to rewatch",
    category: "Video Editing",
    date: "Jul 10, 2026",
    readTime: "3 min read",
    excerpt:
      "From a city street into an iris in one move. How we plan transitions so the join disappears on the first watch.",
    project: "city-eyes",
    body: [
      {
        heading: "Plan the join before the shoot",
        text: "City Eyes pushes from a wide street shot all the way into the eye. That only works when both cameras move at the same speed in the same direction, so we planned the join on paper before anything was filmed.",
      },
      {
        heading: "Grade both sides as one",
        text: "Warm summer grading runs across the street footage and the macro shot, keeping skin tones natural and letting the iris glow. If the color jumps, the eye finds the cut instantly.",
      },
      {
        heading: "Make the loop the reward",
        text: "A seven second piece that people watch twice is worth more than a thirty second one they skip. The best compliment an edit can get is someone scrolling back to see how it was done.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export function postMedia(post: Post) {
  const project = getProject(post.project)!;
  return { video: project.video, poster: project.image, alt: project.alt };
}
