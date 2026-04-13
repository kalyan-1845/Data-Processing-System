// =====================================================
//  CARD CONFIGURATION FILE — Edit your cards here!
// =====================================================
//
//  HOW TO USE:
//  1. Put your images in the "public/cards/" folder
//     Example: public/cards/card1.png, public/cards/card2.jpg
//
//  2. Edit the cards below:
//     - title:       The big text on the card
//     - description: The small text below the title
//     - image:       Path to your image (e.g., "/cards/card1.png")
//     - enabled:     Set to true to SHOW, false to HIDE
//
//  3. Save this file — changes appear instantly!
// =====================================================

export interface CardItem {
  id: number;
  title: string;
  description: string;
  image: string;        // Path relative to public/ folder
  enabled: boolean;     // true = visible, false = hidden
  link?: string;        // Optional: URL to open on click
}

const cards: CardItem[] = [
  // ──────────── CARD 1 ────────────
  {
    id: 1,
    title: "Card 1 Title",
    description: "Write your description here",
    image: "/cards/card1.png",
    enabled: true,
  },

  // ──────────── CARD 2 ────────────
  {
    id: 2,
    title: "Card 2 Title",
    description: "Write your description here",
    image: "/cards/card2.png",
    enabled: true,
  },

  // ──────────── CARD 3 ────────────
  {
    id: 3,
    title: "Card 3 Title",
    description: "Write your description here",
    image: "/cards/card3.png",
    enabled: true,
  },

  // ──────────── CARD 4 ────────────
  {
    id: 4,
    title: "Card 4 Title",
    description: "Write your description here",
    image: "/cards/card4.png",
    enabled: true,
  },

  // ──────────── CARD 5 ────────────
  {
    id: 5,
    title: "Card 5 Title",
    description: "Write your description here",
    image: "/cards/card5.png",
    enabled: true,
  },

  // ──────────── CARD 6 ────────────
  {
    id: 6,
    title: "Card 6 Title",
    description: "Write your description here",
    image: "/cards/card6.png",
    enabled: true,
  },

  // ──────────── CARD 7 ────────────
  {
    id: 7,
    title: "Card 7 Title",
    description: "Write your description here",
    image: "/cards/card7.png",
    enabled: false,
  },

  // ──────────── CARD 8 ────────────
  {
    id: 8,
    title: "Card 8 Title",
    description: "Write your description here",
    image: "/cards/card8.png",
    enabled: false,
  },

  // ──────────── CARD 9 ────────────
  {
    id: 9,
    title: "Card 9 Title",
    description: "Write your description here",
    image: "/cards/card9.png",
    enabled: false,
  },

  // ──────────── CARD 10 ────────────
  {
    id: 10,
    title: "Card 10 Title",
    description: "Write your description here",
    image: "/cards/card10.png",
    enabled: false,
  },

  // ──────────── CARD 11 ────────────
  {
    id: 11,
    title: "Card 11 Title",
    description: "Write your description here",
    image: "/cards/card11.png",
    enabled: false,
  },

  // ──────────── CARD 12 ────────────
  {
    id: 12,
    title: "Card 12 Title",
    description: "Write your description here",
    image: "/cards/card12.png",
    enabled: false,
  },

  // ──────────── CARD 13 ────────────
  {
    id: 13,
    title: "Card 13 Title",
    description: "Write your description here",
    image: "/cards/card13.png",
    enabled: false,
  },

  // ──────────── CARD 14 ────────────
  {
    id: 14,
    title: "Card 14 Title",
    description: "Write your description here",
    image: "/cards/card14.png",
    enabled: false,
  },

  // ──────────── CARD 15 ────────────
  {
    id: 15,
    title: "Card 15 Title",
    description: "Write your description here",
    image: "/cards/card15.png",
    enabled: false,
  },

  // ──────────── CARD 16 ────────────
  {
    id: 16,
    title: "Card 16 Title",
    description: "Write your description here",
    image: "/cards/card16.png",
    enabled: false,
  },

  // ──────────── CARD 17 ────────────
  {
    id: 17,
    title: "Card 17 Title",
    description: "Write your description here",
    image: "/cards/card17.png",
    enabled: false,
  },

  // ──────────── CARD 18 ────────────
  {
    id: 18,
    title: "Card 18 Title",
    description: "Write your description here",
    image: "/cards/card18.png",
    enabled: false,
  },

  // ──────────── CARD 19 ────────────
  {
    id: 19,
    title: "Card 19 Title",
    description: "Write your description here",
    image: "/cards/card19.png",
    enabled: false,
  },

  // ──────────── CARD 20 ────────────
  {
    id: 20,
    title: "Card 20 Title",
    description: "Write your description here",
    image: "/cards/card20.png",
    enabled: false,
  },
];

// Only export cards that are enabled
export const getVisibleCards = () => cards.filter(card => card.enabled);

// Export all cards (for debugging)
export const getAllCards = () => cards;

export default cards;
