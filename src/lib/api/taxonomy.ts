import axios, { AxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return {};
};

// Helper to create axios config with auth headers
const createConfig = (config?: AxiosRequestConfig): AxiosRequestConfig => ({
  ...config,
  headers: {
    ...getAuthHeaders(),
    ...config?.headers,
  },
});

// Types for API responses
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ClothingMenu {
  _id: string;
  title: string;
  isUserCreated: boolean;
  user?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  _id: string;
  title: string;
  category: string | ClothingMenu;
  isPhase2: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeValue {
  _id: string;
  attribute: string | Attribute;
  value: string;
  isPhase2: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubcategoryAttribute {
  _id: string;
  subcategory: string | Subcategory;
  attribute: string | Attribute;
  allowedValues: string[] | AttributeValue[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  _id: string;
  brandName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// Query parameters for list endpoints
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
  [key: string]: any;
}

// ============================================================================
// Clothing Menus API
// ============================================================================

export const getClothingMenus = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<ClothingMenu>>(
    `${API_BASE}/api/admin/taxonomy/clothing-menus`,
    createConfig({ params })
  );
  return response.data;
};

export const getClothingMenuById = async (id: string) => {
  const response = await axios.get<SingleResponse<ClothingMenu>>(
    `${API_BASE}/api/admin/taxonomy/clothing-menus/${id}`,
    createConfig()
  );
  return response.data;
};

export const createClothingMenu = async (data: Partial<ClothingMenu>) => {
  const response = await axios.post<SingleResponse<ClothingMenu>>(
    `${API_BASE}/api/admin/taxonomy/clothing-menus`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateClothingMenu = async (id: string, data: Partial<ClothingMenu>) => {
  const response = await axios.put<SingleResponse<ClothingMenu>>(
    `${API_BASE}/api/admin/taxonomy/clothing-menus/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteClothingMenu = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/taxonomy/clothing-menus/${id}`,
    createConfig()
  );
  return response.data;
};

// ============================================================================
// Subcategories API
// ============================================================================

export const getSubcategories = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<Subcategory>>(
    `${API_BASE}/api/admin/taxonomy/subcategories`,
    createConfig({ params })
  );
  return response.data;
};

export const getSubcategoryById = async (id: string) => {
  const response = await axios.get<SingleResponse<Subcategory>>(
    `${API_BASE}/api/admin/taxonomy/subcategories/${id}`,
    createConfig()
  );
  return response.data;
};

export const createSubcategory = async (data: Partial<Subcategory>) => {
  const response = await axios.post<SingleResponse<Subcategory>>(
    `${API_BASE}/api/admin/taxonomy/subcategories`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateSubcategory = async (id: string, data: Partial<Subcategory>) => {
  const response = await axios.put<SingleResponse<Subcategory>>(
    `${API_BASE}/api/admin/taxonomy/subcategories/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteSubcategory = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/taxonomy/subcategories/${id}`,
    createConfig()
  );
  return response.data;
};

// ============================================================================
// Attributes API
// ============================================================================

export const getAttributes = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<Attribute>>(
    `${API_BASE}/api/admin/taxonomy/attributes`,
    createConfig({ params })
  );
  return response.data;
};

export const getAttributeById = async (id: string) => {
  const response = await axios.get<SingleResponse<Attribute>>(
    `${API_BASE}/api/admin/taxonomy/attributes/${id}`,
    createConfig()
  );
  return response.data;
};

export const createAttribute = async (data: Partial<Attribute>) => {
  const response = await axios.post<SingleResponse<Attribute>>(
    `${API_BASE}/api/admin/taxonomy/attributes`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateAttribute = async (id: string, data: Partial<Attribute>) => {
  const response = await axios.put<SingleResponse<Attribute>>(
    `${API_BASE}/api/admin/taxonomy/attributes/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteAttribute = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/taxonomy/attributes/${id}`,
    createConfig()
  );
  return response.data;
};

// ============================================================================
// Attribute Values API
// ============================================================================

export const getAttributeValues = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<AttributeValue>>(
    `${API_BASE}/api/admin/taxonomy/attribute-values`,
    createConfig({ params })
  );
  return response.data;
};

export const getAttributeValueById = async (id: string) => {
  const response = await axios.get<SingleResponse<AttributeValue>>(
    `${API_BASE}/api/admin/taxonomy/attribute-values/${id}`,
    createConfig()
  );
  return response.data;
};

export const createAttributeValue = async (data: Partial<AttributeValue>) => {
  const response = await axios.post<SingleResponse<AttributeValue>>(
    `${API_BASE}/api/admin/taxonomy/attribute-values`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateAttributeValue = async (id: string, data: Partial<AttributeValue>) => {
  const response = await axios.put<SingleResponse<AttributeValue>>(
    `${API_BASE}/api/admin/taxonomy/attribute-values/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteAttributeValue = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/taxonomy/attribute-values/${id}`,
    createConfig()
  );
  return response.data;
};

// ============================================================================
// Subcategory Attributes API
// ============================================================================

export const getSubcategoryAttributes = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<SubcategoryAttribute>>(
    `${API_BASE}/api/admin/taxonomy/subcategory-attributes`,
    createConfig({ params })
  );
  return response.data;
};

export const getSubcategoryAttributeById = async (id: string) => {
  const response = await axios.get<SingleResponse<SubcategoryAttribute>>(
    `${API_BASE}/api/admin/taxonomy/subcategory-attributes/${id}`,
    createConfig()
  );
  return response.data;
};

export const createSubcategoryAttribute = async (data: Partial<SubcategoryAttribute>) => {
  const response = await axios.post<SingleResponse<SubcategoryAttribute>>(
    `${API_BASE}/api/admin/taxonomy/subcategory-attributes`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateSubcategoryAttribute = async (id: string, data: Partial<SubcategoryAttribute>) => {
  const response = await axios.put<SingleResponse<SubcategoryAttribute>>(
    `${API_BASE}/api/admin/taxonomy/subcategory-attributes/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteSubcategoryAttribute = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/taxonomy/subcategory-attributes/${id}`,
    createConfig()
  );
  return response.data;
};

// ============================================================================
// Brands API
// ============================================================================

export const getBrands = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<Brand>>(
    `${API_BASE}/api/admin/taxonomy/brands`,
    createConfig({ params })
  );
  return response.data;
};

export const getBrandById = async (id: string) => {
  const response = await axios.get<SingleResponse<Brand>>(
    `${API_BASE}/api/admin/taxonomy/brands/${id}`,
    createConfig()
  );
  return response.data;
};

export const createBrand = async (data: Partial<Brand>) => {
  const response = await axios.post<SingleResponse<Brand>>(
    `${API_BASE}/api/admin/taxonomy/brands`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateBrand = async (id: string, data: Partial<Brand>) => {
  const response = await axios.put<SingleResponse<Brand>>(
    `${API_BASE}/api/admin/taxonomy/brands/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteBrand = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/taxonomy/brands/${id}`,
    createConfig()
  );
  return response.data;
};

// ============================================================================
// Tags API
// ============================================================================

export const getTags = async (params?: QueryParams) => {
  const response = await axios.get<PaginatedResponse<Tag>>(
    `${API_BASE}/api/admin/taxonomy/tags`,
    createConfig({ params })
  );
  return response.data;
};

export const getTagById = async (id: string) => {
  const response = await axios.get<SingleResponse<Tag>>(
    `${API_BASE}/api/admin/taxonomy/tags/${id}`,
    createConfig()
  );
  return response.data;
};

export const createTag = async (data: Partial<Tag>) => {
  const response = await axios.post<SingleResponse<Tag>>(
    `${API_BASE}/api/admin/taxonomy/tags`,
    data,
    createConfig()
  );
  return response.data;
};

export const updateTag = async (id: string, data: Partial<Tag>) => {
  const response = await axios.put<SingleResponse<Tag>>(
    `${API_BASE}/api/admin/taxonomy/tags/${id}`,
    data,
    createConfig()
  );
  return response.data;
};

export const deleteTag = async (id: string) => {
  const response = await axios.delete<SingleResponse<null>>(
    `${API_BASE}/api/admin/taxonomy/tags/${id}`,
    createConfig()
  );
  return response.data;
};
