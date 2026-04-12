import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToState, saveState } from "./firebase";

// Clés synchronisées avec Firestore
const SYNC_KEYS = [
  "moods", "evening", "items", "todos", "expenses", "events",
  "voyages", "packingLists", "recipes", "weekPlan", "wishes",
  "jarItems", "notes", "photos", "wyrAnswers", "countdowns", "weekPresence", "travelWish"
];

const INITIAL = {
  moods: {},
  evening: null,
  items: [],
  todos: [],
  expenses: [],
  events: [],
  voyages: [],
  packingLists: {},
  recipes: [],
  weekPlan: {},
  wishes: [],
  jarItems: [
    "Film & popcorn", "Cuisine un nouveau plat",
    "Balade au bord de l'eau", "Jeu de société",
    "Massage", "Apéro balcon", "Playlist & danse", "Lire côte à côte"
  ],
  notes: [],
  photos: [],
  wyrAnswers: {},
  countdowns: [],
  weekPresence: {},
  travelWish: [],
};

export function useFirestore() {
  const [state, setState] = useState(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const skipNextSave = useRef(false);
  const debounceTimer = useRef(null);

  // Écoute Firestore en temps réel
  useEffect(() => {
    const unsub = subscribeToState((remote) => {
      skipNextSave.current = true;
      setState((prev) => {
        const merged = { ...prev };
        SYNC_KEYS.forEach((key) => {
          if (remote[key] !== undefined) {
            merged[key] = remote[key];
          }
        });
        return merged;
      });
      setLoaded(true);
    });
    return unsub;
  }, []);

  // Sauvegarde avec debounce (500ms) quand le state change
  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const toSave = {};
      SYNC_KEYS.forEach((key) => {
        toSave[key] = state[key];
      });
      saveState(toSave);
    }, 500);
  }, [state, loaded]);

  // Helper pour créer un setter par clé
  const makeSetter = useCallback(
    (key) => (valOrFn) => {
      setState((prev) => ({
        ...prev,
        [key]: typeof valOrFn === "function" ? valOrFn(prev[key]) : valOrFn,
      }));
    },
    []
  );

  return { state, loaded, makeSetter };
}
