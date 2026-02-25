/**
 * Feature: cms-page-404-fix
 * Property 2: Preservation - Other Navigation Links Unchanged
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 * 
 * IMPORTANT: This test follows observation-first methodology.
 * These tests capture the CURRENT behavior on UNFIXED code for all non-CMS navigation.
 * 
 * EXPECTED OUTCOME ON UNFIXED CODE: Tests PASS (confirms baseline behavior)
 * EXPECTED OUTCOME AFTER FIX: Tests PASS (confirms no regressions)
 * 
 * This test verifies that:
 * 1. Email Templates link navigates to `/content/email-templates` successfully
 * 2. Main navigation links (Users, Clothing Items, Collections, Subscriptions, Analytics) route correctly
 * 3. Taxonomy section links route correctly
 * 4. Active state highlighting works correctly
 * 5. Role-based filtering (System Monitor, Audit Logs) works correctly
 */

import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import { Sidebar } from '@/components/sidebar';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';

// Mock Next.js navigation hooks
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
let mockPathname = '/dashboard';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  }),
}));

// Create a mock store with admin user
const createMockStore = (role: 'admin' | 'super_admin' = 'admin') => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        admin: {
          _id: '000000000000000000000001',
          email: 'admin@test.com',
          role: role,
        },
        token: 'mock-token',
        isAuthenticated: true,
      },
    },
  });
};

describe('Feature: cms-page-404-fix, Property 2: Preservation - Other Navigation Links Unchanged', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/dashboard';
  });

  afterEach(() => {
    // Clean up after each test to prevent duplicate elements
    jest.clearAllMocks();
  });

  describe('Requirement 3.1: Email Templates Navigation Preservation', () => {
    it('should verify Email Templates link has correct href /content/email-templates', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: Email Templates link should navigate to /content/email-templates
      const emailTemplatesLink = screen.getByRole('link', { name: /Email Templates/i });
      const href = emailTemplatesLink.getAttribute('href');

      // Property: Email Templates href must remain /content/email-templates
      expect(href).toBe('/content/email-templates');
    });

    it('should verify Email Templates link is rendered in Content section', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: Email Templates should be in the Content section
      const contentHeading = screen.getByText('Content');
      expect(contentHeading).toBeInTheDocument();

      const emailTemplatesLink = screen.getByRole('link', { name: /Email Templates/i });
      expect(emailTemplatesLink).toBeInTheDocument();
    });
  });

  describe('Requirement 3.2: Main Navigation Links Preservation', () => {
    it('should verify all main navigation links have correct hrefs using property-based testing', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test cases for main navigation links
          fc.constantFrom(
            { label: 'Users', expectedHref: '/users' },
            { label: 'Clothing Items', expectedHref: '/clothing' },
            { label: 'Collections', expectedHref: '/collections' },
            { label: 'Subscriptions', expectedHref: '/subscriptions' },
            { label: 'Analytics', expectedHref: '/analytics' }
          ),
          async (navItem) => {
            const store = createMockStore();

            const { unmount } = render(
              <Provider store={store}>
                <Sidebar />
              </Provider>
            );

            // Find the navigation link - use getAllByRole and find exact match
            const links = screen.getAllByRole('link', { name: navItem.label });
            const link = links[0]; // Take first match
            const href = link.getAttribute('href');

            // Property: Main navigation links must maintain their correct hrefs
            expect(href).toBe(navItem.expectedHref);
            expect(link).toBeInTheDocument();

            // Clean up after each property test
            unmount();
            cleanup();
          }
        ),
        { numRuns: 25 }
      );
    });

    it('should verify main navigation links are rendered outside sections', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: Main nav items should be rendered before sections
      const usersLink = screen.getByRole('link', { name: 'Users' });
      const clothingLink = screen.getByRole('link', { name: 'Clothing Items' });
      const collectionsLink = screen.getByRole('link', { name: 'Collections' });
      const subscriptionsLink = screen.getByRole('link', { name: 'Subscriptions' });
      const analyticsLink = screen.getByRole('link', { name: 'Analytics' });

      // Property: All main navigation links must be present
      expect(usersLink).toBeInTheDocument();
      expect(clothingLink).toBeInTheDocument();
      expect(collectionsLink).toBeInTheDocument();
      expect(subscriptionsLink).toBeInTheDocument();
      expect(analyticsLink).toBeInTheDocument();
    });
  });

  describe('Requirement 3.2: Taxonomy Section Links Preservation', () => {
    it('should verify all taxonomy links have correct hrefs using property-based testing', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test cases for taxonomy navigation links
          fc.constantFrom(
            { label: 'Clothing Menus', expectedHref: '/taxonomy/clothing-menus' },
            { label: 'Subcategories', expectedHref: '/taxonomy/subcategories' },
            { label: 'Attributes', expectedHref: '/taxonomy/attributes' },
            { label: 'Attribute Values', expectedHref: '/taxonomy/attribute-values' },
            { label: 'Subcategory Attributes', expectedHref: '/taxonomy/subcategory-attributes' },
            { label: 'Brands', expectedHref: '/taxonomy/brands' },
            { label: 'Tags', expectedHref: '/taxonomy/tags' }
          ),
          async (navItem) => {
            const store = createMockStore();

            const { unmount } = render(
              <Provider store={store}>
                <Sidebar />
              </Provider>
            );

            // Find the taxonomy link - use getAllByRole and find exact match
            const links = screen.getAllByRole('link', { name: navItem.label });
            const link = links[0]; // Take first match
            const href = link.getAttribute('href');

            // Property: Taxonomy links must maintain their correct hrefs
            expect(href).toBe(navItem.expectedHref);
            expect(link).toBeInTheDocument();

            // Clean up after each property test
            unmount();
            cleanup();
          }
        ),
        { numRuns: 35 }
      );
    });

    it('should verify taxonomy section heading is rendered', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: Taxonomy section should have a heading
      const taxonomyHeading = screen.getByText('Taxonomy');
      expect(taxonomyHeading).toBeInTheDocument();
    });
  });

  describe('Requirement 3.2: Active State Highlighting Preservation', () => {
    it('should verify active state highlighting works for different routes using property-based testing', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test cases for different active routes
          fc.constantFrom(
            { pathname: '/users', activeLabel: 'Users' },
            { pathname: '/clothing', activeLabel: 'Clothing Items' },
            { pathname: '/collections', activeLabel: 'Collections' },
            { pathname: '/subscriptions', activeLabel: 'Subscriptions' },
            { pathname: '/analytics', activeLabel: 'Analytics' },
            { pathname: '/taxonomy/clothing-menus', activeLabel: 'Clothing Menus' },
            { pathname: '/taxonomy/subcategories', activeLabel: 'Subcategories' },
            { pathname: '/content/email-templates', activeLabel: 'Email Templates' }
          ),
          async (testCase) => {
            // Set the mock pathname
            mockPathname = testCase.pathname;

            const store = createMockStore();

            const { unmount } = render(
              <Provider store={store}>
                <Sidebar />
              </Provider>
            );

            // Find the active link - use getAllByRole and find exact match
            const links = screen.getAllByRole('link', { name: testCase.activeLabel });
            const activeLink = links[0]; // Take first match

            // Property: Active link should have the active styling classes
            // Observation: Active links have 'bg-gray-900' and 'text-white' classes
            expect(activeLink.className).toContain('bg-gray-900');
            expect(activeLink.className).toContain('text-white');

            // Clean up after each property test
            unmount();
            cleanup();
          }
        ),
        { numRuns: 40 }
      );
    });

    it('should verify inactive links have correct styling', () => {
      mockPathname = '/users';
      const store = createMockStore();

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: Inactive links should have different styling
      const inactiveLink = screen.getByRole('link', { name: 'Clothing Items' });

      // Property: Inactive links should have 'text-gray-700' class
      expect(inactiveLink.className).toContain('text-gray-700');
      expect(inactiveLink.className).not.toContain('bg-gray-900');
    });
  });

  describe('Requirement 3.2: Role-Based Filtering Preservation', () => {
    it('should verify System Monitor and Audit Logs are visible for super_admin', () => {
      const store = createMockStore('super_admin');

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: super_admin should see System Monitor and Audit Logs
      const systemMonitorLinks = screen.getAllByRole('link', { name: 'System Monitor' });
      const auditLogsLinks = screen.getAllByRole('link', { name: 'Audit Logs' });

      // Property: super_admin role must have access to restricted links
      expect(systemMonitorLinks[0]).toBeInTheDocument();
      expect(auditLogsLinks[0]).toBeInTheDocument();
      expect(systemMonitorLinks[0].getAttribute('href')).toBe('/system');
      expect(auditLogsLinks[0].getAttribute('href')).toBe('/audit-logs');
    });

    it('should verify System Monitor and Audit Logs are hidden for regular admin', () => {
      const store = createMockStore('admin');

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: regular admin should NOT see System Monitor and Audit Logs
      const systemMonitorLink = screen.queryByRole('link', { name: 'System Monitor' });
      const auditLogsLink = screen.queryByRole('link', { name: 'Audit Logs' });

      // Property: regular admin role must NOT have access to restricted links
      expect(systemMonitorLink).not.toBeInTheDocument();
      expect(auditLogsLink).not.toBeInTheDocument();
    });

    it('should verify role-based filtering using property-based testing', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test cases for different roles
          fc.constantFrom(
            { role: 'admin' as const, shouldSeeRestricted: false },
            { role: 'super_admin' as const, shouldSeeRestricted: true }
          ),
          async (testCase) => {
            const store = createMockStore(testCase.role);

            const { unmount } = render(
              <Provider store={store}>
                <Sidebar />
              </Provider>
            );

            const systemMonitorLinks = screen.queryAllByRole('link', { name: 'System Monitor' });
            const auditLogsLinks = screen.queryAllByRole('link', { name: 'Audit Logs' });

            // Property: Role-based filtering must work correctly
            if (testCase.shouldSeeRestricted) {
              expect(systemMonitorLinks.length).toBeGreaterThan(0);
              expect(auditLogsLinks.length).toBeGreaterThan(0);
            } else {
              expect(systemMonitorLinks.length).toBe(0);
              expect(auditLogsLinks.length).toBe(0);
            }

            // Clean up after each property test
            unmount();
            cleanup();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Comprehensive Preservation: All Non-CMS Links', () => {
    it('should verify all non-CMS navigation links maintain correct behavior using property-based testing', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test cases for ALL non-CMS navigation links
          fc.constantFrom(
            // Main navigation
            { label: 'Users', expectedHref: '/users', section: 'main' },
            { label: 'Clothing Items', expectedHref: '/clothing', section: 'main' },
            { label: 'Collections', expectedHref: '/collections', section: 'main' },
            { label: 'Subscriptions', expectedHref: '/subscriptions', section: 'main' },
            { label: 'Analytics', expectedHref: '/analytics', section: 'main' },
            // Taxonomy section
            { label: 'Clothing Menus', expectedHref: '/taxonomy/clothing-menus', section: 'taxonomy' },
            { label: 'Subcategories', expectedHref: '/taxonomy/subcategories', section: 'taxonomy' },
            { label: 'Attributes', expectedHref: '/taxonomy/attributes', section: 'taxonomy' },
            { label: 'Attribute Values', expectedHref: '/taxonomy/attribute-values', section: 'taxonomy' },
            { label: 'Subcategory Attributes', expectedHref: '/taxonomy/subcategory-attributes', section: 'taxonomy' },
            { label: 'Brands', expectedHref: '/taxonomy/brands', section: 'taxonomy' },
            { label: 'Tags', expectedHref: '/taxonomy/tags', section: 'taxonomy' },
            // Content section (excluding CMS)
            { label: 'Email Templates', expectedHref: '/content/email-templates', section: 'content' }
          ),
          async (navItem) => {
            const store = createMockStore();

            const { unmount } = render(
              <Provider store={store}>
                <Sidebar />
              </Provider>
            );

            // Find the navigation link - use getAllByRole and find exact match
            const links = screen.getAllByRole('link', { name: navItem.label });
            const link = links[0]; // Take first match
            const href = link.getAttribute('href');

            // Property: ALL non-CMS navigation links must maintain their correct hrefs
            // This is the core preservation property
            expect(href).toBe(navItem.expectedHref);
            expect(link).toBeInTheDocument();

            // Additional property: Link should be clickable
            expect(link).toHaveAttribute('href');

            // Clean up after each property test
            unmount();
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Sidebar Structure Preservation', () => {
    it('should verify sidebar renders all expected sections', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: Sidebar should have Taxonomy and Content sections
      const taxonomyHeading = screen.getByText('Taxonomy');
      const contentHeading = screen.getByText('Content');

      // Property: Section headings must be present
      expect(taxonomyHeading).toBeInTheDocument();
      expect(contentHeading).toBeInTheDocument();
    });

    it('should verify admin info is displayed', () => {
      const store = createMockStore('admin');

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: Admin email and role badge should be displayed
      const adminEmail = screen.getByText('admin@test.com');
      const adminBadge = screen.getByText('Admin');

      // Property: Admin info must be visible
      expect(adminEmail).toBeInTheDocument();
      expect(adminBadge).toBeInTheDocument();
    });

    it('should verify logout button is present', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      // Observation: Logout button should be present
      const logoutButton = screen.getByRole('button', { name: /Logout/i });

      // Property: Logout button must be visible
      expect(logoutButton).toBeInTheDocument();
    });
  });
});
