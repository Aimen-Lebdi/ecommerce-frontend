/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchAddressesAPI,
  addAddressAPI,
  updateAddressAPI,
  setDefaultAddressAPI,
  removeAddressAPI,
  type Address,
  type AddressResponse,
} from "./addressesAPI";

// Interface for the create-address payload
export interface AddAddressData {
  label: string;
  wilaya: string;
  dayra: string;
  baladiya: string;
}

// Interface for the update-address payload
export interface UpdateAddressData {
  addressId: string;
  label?: string;
  wilaya?: string;
  dayra?: string;
  baladiya?: string;
  isDefault?: boolean;
}

// Interface for addresses state
interface AddressesState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  isSettingDefault: boolean;
}

// Initial state
const initialState: AddressesState = {
  addresses: [],
  loading: false,
  error: null,
  isAdding: false,
  isUpdating: false,
  isRemoving: false,
  isSettingDefault: false,
};

// Async thunk to fetch logged user addresses
export const fetchAddresses = createAsyncThunk<
  AddressResponse,
  void,
  { rejectValue: string }
>("addresses/fetchAddresses", async (_, { rejectWithValue }) => {
  try {
    const data = await fetchAddressesAPI();
    return data;
  } catch (err: any) {
    // Handle 404 as an empty address book
    if (err.response?.status === 404) {
      return { status: "success", results: 0, data: [] };
    }
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch addresses"
    );
  }
});

// Async thunk to add a new address
export const createAddress = createAsyncThunk<
  AddressResponse,
  AddAddressData,
  { rejectValue: string }
>("addresses/createAddress", async (addressData, { rejectWithValue }) => {
  try {
    const data = await addAddressAPI(addressData);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to add address"
    );
  }
});

// Async thunk to update an address
export const updateAddress = createAsyncThunk<
  AddressResponse,
  UpdateAddressData,
  { rejectValue: string }
>("addresses/updateAddress", async (payload, { rejectWithValue }) => {
  try {
    const { addressId, ...addressData } = payload;
    const data = await updateAddressAPI(addressId, addressData);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to update address"
    );
  }
});

// Async thunk to set an address as default
export const setDefaultAddress = createAsyncThunk<
  AddressResponse,
  string,
  { rejectValue: string }
>("addresses/setDefaultAddress", async (addressId, { rejectWithValue }) => {
  try {
    const data = await setDefaultAddressAPI(addressId);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message ||
        err.message ||
        "Failed to set default address"
    );
  }
});

// Async thunk to remove an address
export const removeAddress = createAsyncThunk<
  AddressResponse,
  string,
  { rejectValue: string }
>("addresses/removeAddress", async (addressId, { rejectWithValue }) => {
  try {
    const data = await removeAddressAPI(addressId);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to remove address"
    );
  }
});

// Addresses slice
const addressesSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAddresses: (state) => {
      state.addresses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAddresses.fulfilled,
        (state, action: PayloadAction<AddressResponse>) => {
          state.loading = false;
          state.addresses = action.payload.data || [];
        }
      )
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch addresses";
      })
      // Create address
      .addCase(createAddress.pending, (state) => {
        state.isAdding = true;
        state.error = null;
      })
      .addCase(
        createAddress.fulfilled,
        (state, action: PayloadAction<AddressResponse>) => {
          state.isAdding = false;
          state.addresses = action.payload.data || state.addresses;
        }
      )
      .addCase(createAddress.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload || "Failed to add address";
      })
      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        updateAddress.fulfilled,
        (state, action: PayloadAction<AddressResponse>) => {
          state.isUpdating = false;
          state.addresses = action.payload.data || state.addresses;
        }
      )
      .addCase(updateAddress.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update address";
      })
      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.isSettingDefault = true;
        state.error = null;
      })
      .addCase(
        setDefaultAddress.fulfilled,
        (state, action: PayloadAction<AddressResponse>) => {
          state.isSettingDefault = false;
          state.addresses = action.payload.data || state.addresses;
        }
      )
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.isSettingDefault = false;
        state.error = action.payload || "Failed to set default address";
      })
      // Remove address
      .addCase(removeAddress.pending, (state) => {
        state.isRemoving = true;
        state.error = null;
      })
      .addCase(
        removeAddress.fulfilled,
        (state, action: PayloadAction<AddressResponse>) => {
          state.isRemoving = false;
          state.addresses = action.payload.data || state.addresses;
        }
      )
      .addCase(removeAddress.rejected, (state, action) => {
        state.isRemoving = false;
        state.error = action.payload || "Failed to remove address";
      });
  },
});

export const { clearError, resetAddresses } = addressesSlice.actions;

export default addressesSlice.reducer;
