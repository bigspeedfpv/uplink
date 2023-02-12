import { createSlice } from "@reduxjs/toolkit";

export const dfuSlice = createSlice({
  name: "dfu",
  initialState: {
    value: 0,
  },
  reducers: {
    setDfuStatus: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setDfuStatus } = dfuSlice.actions;

export default dfuSlice.reducer;
