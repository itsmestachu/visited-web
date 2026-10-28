import { useEffect, useReducer } from "react";
import { reducer } from "../store/reducer";
import { loadData, saveData } from "../store/persistence";

export const useAppData = () => {
  const [data, dispatch] = useReducer(reducer, undefined, loadData);
  useEffect(() => saveData(data), [data]);
  return [data, dispatch] as const;
};
