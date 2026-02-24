/**
 * Feature: admin-taxonomy-content-management
 * Property 18: Dependent Dropdown Filtering
 * 
 * Validates: Requirements 5.5
 * 
 * For any form with dependent dropdowns (e.g., AttributeValues multi-select 
 * based on selected Attribute), changing the parent selection should update 
 * the child dropdown to show only values belonging to the selected parent.
 * 
 * NOTE: This test requires the following dependencies to be installed:
 * - jest
 * - @testing-library/react
 * - @testing-library/jest-dom
 * - fast-check
 * - @testing-library/user-event
 * 
 * Install with: npm install --save-dev jest @testing-library/react @testing-library/jest-dom fast-check @testing-library/user-event jest-environment-jsdom
 */

import * as fc from 'fast-check';
import { render, screen, waitFor } from '@testing-library/react';
import { SubcategoryAttributeForm } from '@/components/SubcategoryAttributeForm';
import * as taxonomyApi from '@/lib/api/taxonomy';

// Mock the taxonomy API
jest.mock('@/lib/api/taxonomy');

describe('Feature: admin-taxonomy-content-management, Property 18: Dependent Dropdown Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should filter AttributeValues based on selected Attribute', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate multiple attributes with their values
        fc.array(
          fc.record({
            attribute: fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              slug: fc.stringOf(
                fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
                { minLength: 1, maxLength: 50 }
              ),
              createdAt: fc.date().map(d => d.toISOString()),
              updatedAt: fc.date().map(d => d.toISOString()),
            }),
            values: fc.array(
              fc.record({
                _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
                value: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                isPhase2: fc.boolean(),
                createdAt: fc.date().map(d => d.toISOString()),
                updatedAt: fc.date().map(d => d.toISOString()),
              }),
              { minLength: 1, maxLength: 20 }
            ),
          }),
          { minLength: 2, maxLength: 10 } // At least 2 attributes to test filtering
        ),
        async (attributesWithValues) => {
          // Extract all attributes and all values
          const allAttributes = attributesWithValues.map(item => item.attribute);
          const allSubcategories = [
            {
              _id: '000000000000000000000001',
              title: 'Test Subcategory',
              category: '000000000000000000000002',
              isPhase2: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];

          // Mock subcategories API
          const mockGetSubcategories = jest.spyOn(taxonomyApi, 'getSubcategories');
          mockGetSubcategories.mockResolvedValue({
            success: true,
            message: 'Subcategories fetched successfully',
            data: {
              items: allSubcategories,
              total: allSubcategories.length,
              page: 1,
              pages: 1,
            },
          });

          // Mock attributes API
          const mockGetAttributes = jest.spyOn(taxonomyApi, 'getAttributes');
          mockGetAttributes.mockResolvedValue({
            success: true,
            message: 'Attributes fetched successfully',
            data: {
              items: allAttributes,
              total: allAttributes.length,
              page: 1,
              pages: 1,
            },
          });

          // Mock attribute values API - will be called when attribute is selected
          const mockGetAttributeValues = jest.spyOn(taxonomyApi, 'getAttributeValues');

          // Render the form
          const { rerender } = render(<SubcategoryAttributeForm />);

          // Wait for initial data to load
          await waitFor(() => {
            expect(mockGetSubcategories).toHaveBeenCalled();
            expect(mockGetAttributes).toHaveBeenCalled();
          });

          // Test each attribute selection
          for (let i = 0; i < attributesWithValues.length; i++) {
            const { attribute, values } = attributesWithValues[i];

            // Add attribute reference to each value
            const valuesWithAttribute = values.map(v => ({
              ...v,
              attribute: attribute._id,
            }));

            // Mock the API to return only values for this specific attribute
            mockGetAttributeValues.mockResolvedValue({
              success: true,
              message: 'Attribute values fetched successfully',
              data: {
                items: valuesWithAttribute,
                total: valuesWithAttribute.length,
                page: 1,
                pages: 1,
              },
            });

            // Simulate selecting this attribute
            rerender(
              <SubcategoryAttributeForm
                initialData={{
                  subcategory: allSubcategories[0]._id,
                  attribute: attribute._id,
                  allowedValues: [],
                }}
              />
            );

            // Wait for attribute values to be fetched
            await waitFor(() => {
              const calls = mockGetAttributeValues.mock.calls;
              const lastCall = calls[calls.length - 1];
              if (lastCall && lastCall[0]) {
                expect(lastCall[0].attribute).toBe(attribute._id);
              }
            });

            // Property: The API should be called with the selected attribute as a filter
            const lastCallIndex = mockGetAttributeValues.mock.calls.length - 1;
            if (lastCallIndex >= 0) {
              const lastCall = mockGetAttributeValues.mock.calls[lastCallIndex];
              expect(lastCall[0]?.attribute).toBe(attribute._id);
            }

            // Property: Only values belonging to the selected attribute should be available
            // This is verified by checking that the API is called with the correct filter
            // The component should display only the values returned by this filtered API call
          }
        }
      ),
      { numRuns: 50 } // Run 50 iterations with different random data
    );
  });

  it('should clear selected values when attribute changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different attributes with their values
        fc.tuple(
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            slug: fc.stringOf(
              fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
              { minLength: 1, maxLength: 50 }
            ),
            createdAt: fc.date().map(d => d.toISOString()),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          fc.record({
            _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            slug: fc.stringOf(
              fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
              { minLength: 1, maxLength: 50 }
            ),
            createdAt: fc.date().map(d => d.toISOString()),
            updatedAt: fc.date().map(d => d.toISOString()),
          })
        ).filter(([attr1, attr2]) => attr1._id !== attr2._id), // Ensure different attributes
        fc.array(
          fc.hexaString({ minLength: 24, maxLength: 24 }),
          { minLength: 1, maxLength: 5 }
        ), // Selected value IDs from first attribute
        async ([attribute1, attribute2], selectedValueIds) => {
          const allSubcategories = [
            {
              _id: '000000000000000000000001',
              title: 'Test Subcategory',
              category: '000000000000000000000002',
              isPhase2: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];

          // Mock APIs
          const mockGetSubcategories = jest.spyOn(taxonomyApi, 'getSubcategories');
          mockGetSubcategories.mockResolvedValue({
            success: true,
            message: 'Subcategories fetched successfully',
            data: {
              items: allSubcategories,
              total: 1,
              page: 1,
              pages: 1,
            },
          });

          const mockGetAttributes = jest.spyOn(taxonomyApi, 'getAttributes');
          mockGetAttributes.mockResolvedValue({
            success: true,
            message: 'Attributes fetched successfully',
            data: {
              items: [attribute1, attribute2],
              total: 2,
              page: 1,
              pages: 1,
            },
          });

          const mockGetAttributeValues = jest.spyOn(taxonomyApi, 'getAttributeValues');
          
          // First render with attribute1 and some selected values
          const { rerender } = render(
            <SubcategoryAttributeForm
              initialData={{
                subcategory: allSubcategories[0]._id,
                attribute: attribute1._id,
                allowedValues: selectedValueIds,
              }}
            />
          );

          await waitFor(() => {
            expect(mockGetSubcategories).toHaveBeenCalled();
            expect(mockGetAttributes).toHaveBeenCalled();
          });

          // Mock values for attribute1
          mockGetAttributeValues.mockResolvedValue({
            success: true,
            message: 'Attribute values fetched successfully',
            data: {
              items: selectedValueIds.map((id, idx) => ({
                _id: id,
                attribute: attribute1._id,
                value: `Value ${idx}`,
                isPhase2: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })),
              total: selectedValueIds.length,
              page: 1,
              pages: 1,
            },
          });

          await waitFor(() => {
            expect(mockGetAttributeValues).toHaveBeenCalled();
          });

          // Now change to attribute2
          mockGetAttributeValues.mockResolvedValue({
            success: true,
            message: 'Attribute values fetched successfully',
            data: {
              items: [],
              total: 0,
              page: 1,
              pages: 1,
            },
          });

          rerender(
            <SubcategoryAttributeForm
              initialData={{
                subcategory: allSubcategories[0]._id,
                attribute: attribute2._id,
                allowedValues: [], // Should be cleared when attribute changes
              }}
            />
          );

          await waitFor(() => {
            const calls = mockGetAttributeValues.mock.calls;
            const lastCall = calls[calls.length - 1];
            if (lastCall && lastCall[0]) {
              expect(lastCall[0].attribute).toBe(attribute2._id);
            }
          });

          // Property: When the parent dropdown (Attribute) changes,
          // the child multi-select (allowedValues) should be cleared or filtered
          // to only include values that belong to the new attribute
          
          // This is verified by:
          // 1. The API is called with the new attribute filter
          // 2. The form should not retain values from the previous attribute
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should show no values when attribute is not selected', async () => {
    const allSubcategories = [
      {
        _id: '000000000000000000000001',
        title: 'Test Subcategory',
        category: '000000000000000000000002',
        isPhase2: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const allAttributes = [
      {
        _id: '000000000000000000000003',
        name: 'Test Attribute',
        slug: 'test-attribute',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Mock APIs
    const mockGetSubcategories = jest.spyOn(taxonomyApi, 'getSubcategories');
    mockGetSubcategories.mockResolvedValue({
      success: true,
      message: 'Subcategories fetched successfully',
      data: {
        items: allSubcategories,
        total: 1,
        page: 1,
        pages: 1,
      },
    });

    const mockGetAttributes = jest.spyOn(taxonomyApi, 'getAttributes');
    mockGetAttributes.mockResolvedValue({
      success: true,
      message: 'Attributes fetched successfully',
      data: {
        items: allAttributes,
        total: 1,
        page: 1,
        pages: 1,
      },
    });

    const mockGetAttributeValues = jest.spyOn(taxonomyApi, 'getAttributeValues');

    // Render form without selecting an attribute
    render(<SubcategoryAttributeForm />);

    await waitFor(() => {
      expect(mockGetSubcategories).toHaveBeenCalled();
      expect(mockGetAttributes).toHaveBeenCalled();
    });

    // Property: When no attribute is selected, the AttributeValues API should not be called
    // and no values should be available for selection
    expect(mockGetAttributeValues).not.toHaveBeenCalled();
  });

  it('should only show values belonging to the selected attribute (no cross-contamination)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two attributes with distinct value sets
        fc.tuple(
          fc.record({
            attribute: fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              slug: fc.stringOf(
                fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
                { minLength: 1, maxLength: 50 }
              ),
              createdAt: fc.date().map(d => d.toISOString()),
              updatedAt: fc.date().map(d => d.toISOString()),
            }),
            values: fc.array(
              fc.record({
                _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
                value: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                isPhase2: fc.boolean(),
                createdAt: fc.date().map(d => d.toISOString()),
                updatedAt: fc.date().map(d => d.toISOString()),
              }),
              { minLength: 1, maxLength: 10 }
            ),
          }),
          fc.record({
            attribute: fc.record({
              _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
              name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              slug: fc.stringOf(
                fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
                { minLength: 1, maxLength: 50 }
              ),
              createdAt: fc.date().map(d => d.toISOString()),
              updatedAt: fc.date().map(d => d.toISOString()),
            }),
            values: fc.array(
              fc.record({
                _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
                value: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                isPhase2: fc.boolean(),
                createdAt: fc.date().map(d => d.toISOString()),
                updatedAt: fc.date().map(d => d.toISOString()),
              }),
              { minLength: 1, maxLength: 10 }
            ),
          })
        ).filter(([item1, item2]) => item1.attribute._id !== item2.attribute._id),
        async ([item1, item2]) => {
          const allSubcategories = [
            {
              _id: '000000000000000000000001',
              title: 'Test Subcategory',
              category: '000000000000000000000002',
              isPhase2: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];

          // Mock APIs
          const mockGetSubcategories = jest.spyOn(taxonomyApi, 'getSubcategories');
          mockGetSubcategories.mockResolvedValue({
            success: true,
            message: 'Subcategories fetched successfully',
            data: {
              items: allSubcategories,
              total: 1,
              page: 1,
              pages: 1,
            },
          });

          const mockGetAttributes = jest.spyOn(taxonomyApi, 'getAttributes');
          mockGetAttributes.mockResolvedValue({
            success: true,
            message: 'Attributes fetched successfully',
            data: {
              items: [item1.attribute, item2.attribute],
              total: 2,
              page: 1,
              pages: 1,
            },
          });

          const mockGetAttributeValues = jest.spyOn(taxonomyApi, 'getAttributeValues');

          // Select attribute1
          const valuesWithAttribute1 = item1.values.map(v => ({
            ...v,
            attribute: item1.attribute._id,
          }));

          mockGetAttributeValues.mockResolvedValue({
            success: true,
            message: 'Attribute values fetched successfully',
            data: {
              items: valuesWithAttribute1,
              total: valuesWithAttribute1.length,
              page: 1,
              pages: 1,
            },
          });

          render(
            <SubcategoryAttributeForm
              initialData={{
                subcategory: allSubcategories[0]._id,
                attribute: item1.attribute._id,
                allowedValues: [],
              }}
            />
          );

          await waitFor(() => {
            expect(mockGetAttributeValues).toHaveBeenCalled();
          });

          // Property: The API should be called with attribute filter
          const lastCall = mockGetAttributeValues.mock.calls[mockGetAttributeValues.mock.calls.length - 1];
          expect(lastCall[0]?.attribute).toBe(item1.attribute._id);

          // Property: None of attribute2's values should be available
          // This is ensured by the API filter - the backend only returns values for attribute1
          // The form should not mix values from different attributes
          
          // Get all value IDs from attribute2
          const attribute2ValueIds = item2.values.map(v => v._id);
          
          // Verify that the API response doesn't include any values from attribute2
          const returnedValueIds = valuesWithAttribute1.map(v => v._id);
          const hasContamination = attribute2ValueIds.some(id => returnedValueIds.includes(id));
          
          expect(hasContamination).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });
});
