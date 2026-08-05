/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchPhonesAPI,
  addPhoneAPI,
  updatePhoneAPI,
  setDefaultPhoneAPI,
  removePhoneAPI,
  type Phone,
  type PhoneResponse,
} from "./phonesAPI";

// Interface for the create-phone payload
export interface AddPhoneData {
  phone: string;
  label: string;
}

// Interface for the update-phone payload
export interface UpdatePhoneData {
  phoneId: string;
  phone?: string;
  label?: string;
  isDefault?: boolean;
}

// Interface for phones state
interface PhonesState {
  phones: Phone[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  isSettingDefault: boolean;
}

// Initial state
const initialState: PhonesState = {
  phones: [],
  loading: false,
  error: null,
  isAdding: false,
  isUpdating: false,
  isRemoving: false,
  isSettingDefault: false,
};

// Async thunk to fetch logged user phones
export const fetchPhones = createAsyncThunk<
  PhoneResponse,
  void,
  { rejectValue: string }
>("phones/fetchPhones", async (_, { rejectWithValue }) => {
  try {
    const data = await fetchPhonesAPI();
    return data;
  } catch (err: any) {
    // Handle 404 as an empty phone list
    if (err.response?.status === 404) {
      return { status: "success", results: 0, data: [] };
    }
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch phones"
    );
  }
});

// Async thunk to add a new phone number
export const createPhone = createAsyncThunk<
  PhoneResponse,
  AddPhoneData,
  { rejectValue: string }
>("phones/createPhone", async (phoneData, { rejectWithValue }) => {
  try {
    const data = await addPhoneAPI(phoneData);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to add phone"
    );
  }
});

// Async thunk to update a phone number
export const updatePhone = createAsyncThunk<
  PhoneResponse,
  UpdatePhoneData,
  { rejectValue: string }
>("phones/updatePhone", async (payload, { rejectWithValue }) => {
  try {
    const { phoneId, ...phoneData } = payload;
    const data = await updatePhoneAPI(phoneId, phoneData);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to update phone"
    );
  }
});

// Async thunk to set a phone number as default
export const setDefaultPhone = createAsyncThunk<
  PhoneResponse,
  string,
  { rejectValue: string }
>("phones/setDefaultPhone", async (phoneId, { rejectWithValue }) => {
  try {
    const data = await setDefaultPhoneAPI(phoneId);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message ||
        err.message ||
        "Failed to set default phone"
    );
  }
});

// Async thunk to remove a phone number
export const removePhone = createAsyncThunk<
  PhoneResponse,
  string,
  { rejectValue: string }
>("phones/removePhone", async (phoneId, { rejectWithValue }) => {
  try {
    const data = await removePhoneAPI(phoneId);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to remove phone"
    );
  }
});

// Phones slice
const phonesSlice = createSlice({
  name: "phones",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPhones: (state) => {
      state.phones = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch phones
      .addCase(fetchPhones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPhones.fulfilled,
        (state, action: PayloadAction<PhoneResponse>) => {
          state.loading = false;
          state.phones = action.payload.data || [];
        }
      )
      .addCase(fetchPhones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch phones";
      })
      // Create phone
      .addCase(createPhone.pending, (state) => {
        state.isAdding = true;
        state.error = null;
      })
      .addCase(
        createPhone.fulfilled,
        (state, action: PayloadAction<PhoneResponse>) => {
          state.isAdding = false;
          state.phones = action.payload.data || state.phones;
        }
      )
      .addCase(createPhone.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload || "Failed to add phone";
      })
      // Update phone
      .addCase(updatePhone.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        updatePhone.fulfilled,
        (state, action: PayloadAction<PhoneResponse>) => {
          state.isUpdating = false;
          state.phones = action.payload.data || state.phones;
        }
      )
      .addCase(updatePhone.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update phone";
      })
      // Set default phone
      .addCase(setDefaultPhone.pending, (state) => {
        state.isSettingDefault = true;
        state.error = null;
      })
      .addCase(
        setDefaultPhone.fulfilled,
        (state, action: PayloadAction<PhoneResponse>) => {
          state.isSettingDefault = false;
          state.phones = action.payload.data || state.phones;
        }
      )
      .addCase(setDefaultPhone.rejected, (state, action) => {
        state.isSettingDefault = false;
        state.error = action.payload || "Failed to set default phone";
      })
      // Remove phone
      .addCase(removePhone.pending, (state) => {
        state.isRemoving = true;
        state.error = null;
      })
      .addCase(
        removePhone.fulfilled,
        (state, action: PayloadAction<PhoneResponse>) => {
          state.isRemoving = false;
          state.phones = action.payload.data || state.phones;
        }
      )
      .addCase(removePhone.rejected, (state, action) => {
        state.isRemoving = false;
        state.error = action.payload || "Failed to remove phone";
      });
  },
});

export const { clearError, resetPhones } = phonesSlice.actions;

export default phonesSlice.reducer;
