import { createSlice } from "@reduxjs/toolkit";

export const connectionSlice = createSlice({
  name: "connection",
  initialState: {
    value: false,
  },
  reducers: {
    setConnection: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setConnection } = connectionSlice.actions;

export default connectionSlice.reducer;
