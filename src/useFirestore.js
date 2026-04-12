import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToState, saveState } from "./firebase";

const SYNC_KEYS = [
  "moods", "evening", "items", "todos", "expenses", "events",
  "voyages", "packingLists", "recipes", "weekPlan", "wishes",
  "jarItems", "notes", "photos", "wyrAnswers", "countdowns",
  "weekPresence", "travelWish", "moodHistory"
];

const INITIAL = {
  moods: {}, evening: null, items: [], todos: [], expenses: [],
  events: [], voyages: [], packingLists: {}, recipes: [], weekPlan: {},
  wishes: [], jarItems: ["Film & popcorn","Cuisine un nouveau plat","Balade","Jeu de société","Massage","Apéro balcon","Playlist & danse","Lire côte à côte"],
  notes: [], photos: [], wyrAnswers: {}, countdowns: [],
  weekPresence: {}, travelWish: [], moodHistory: {},
};

export function useFirestore() {
  const [state, setState] = useState(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const skipNextSave = useRef(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const unsub = subscribeToState((remote) => {
      if (remote) {
        skipNextSave.current = true;
        setState((prev) => {
          const merged = { ...prev };
          SYNC_KEYS.forEach((key) => {
            if (remote[key] !== undefined) merged[key] = remote[key];
          });
          return merged;
        });
      }
      setLoaded(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const toSave = {};
      SYNC_KEYS.forEach((key) => { toSave[key] = state[key]; });
      saveState(toSave);
    }, 500);
  }, [state, loaded]);

  const makeSetter = useCallback(
    (key) => (valOrFn) => {
      setState((prev) => ({
        ...prev,
        [key]: typeof valOrFn === "function" ? valOrFn(prev[key]) : valOrFn,
      }));
    }, []
  );

  return { state, loaded, makeSetter };
}