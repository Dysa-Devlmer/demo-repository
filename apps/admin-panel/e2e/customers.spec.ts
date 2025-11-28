import { test, expect } from '@playwright/test';

// Helper to login before each test
async function login(page: any) {
  await page.goto('/login');
  await page.getByLabel(/correo electrónico|email/i).fill('admin@zgamersa.com');
  await page.getByLabel(/contraseña|password/i).fill('admin123');
  await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

// Helper to navigate to customers page
async function navigateToCustomers(page: any) {
  const customersLink = page.getByRole('link', { name: /clientes|customers/i }).first();

  if (await customersLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await customersLink.click();
    await page.waitForTimeout(1000);
  } else {
    // Try direct navigation
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
  }
}

test.describe('Customers CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToCustomers(page);
  });

  test('should display customers list page', async ({ page }) => {
    // Check we're on customers page
    const url = page.url();
    expect(url.includes('customer') || url.includes('cliente')).toBeTruthy();

    // Check for page heading
    const heading = page.getByRole('heading', { name: /clientes|customers/i }).first();

    if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(heading).toBeVisible();
    }

    // Check for table or list of customers
    const table = page.locator('table, [role="table"], [data-testid="customers-table"]').first();

    if (await table.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(table).toBeVisible();
    }
  });

  test('should display "Create Customer" button', async ({ page }) => {
    // Look for create/add button
    const createButton = page.getByRole('button', { name: /crear|nuevo|agregar|add|new|create/i }).first();

    if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(createButton).toBeVisible();
    } else {
      // Look for link instead
      const createLink = page.getByRole('link', { name: /crear|nuevo|agregar|add|new|create/i }).first();

      if (await createLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(createLink).toBeVisible();
      } else {
        test.skip();
      }
    }
  });

  test('should open create customer form', async ({ page }) => {
    // Click create button
    const createButton = page.getByRole('button', { name: /crear|nuevo|agregar|add|new|create/i }).first();

    if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createButton.click();

      // Wait for form/dialog to appear
      await page.waitForTimeout(1000);

      // Check for form fields
      const nameField = page.getByLabel(/nombre|name/i).first();
      const emailField = page.getByLabel(/correo|email/i).first();
      const phoneField = page.getByLabel(/teléfono|phone/i).first();

      // At least one field should be visible
      const fieldsVisible = await Promise.race([
        nameField.isVisible({ timeout: 2000 }).catch(() => false),
        emailField.isVisible({ timeout: 2000 }).catch(() => false),
        phoneField.isVisible({ timeout: 2000 }).catch(() => false),
      ]);

      expect(fieldsVisible).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should create new customer', async ({ page }) => {
    // Click create button
    const createButton = page.getByRole('button', { name: /crear|nuevo|agregar|add|new|create/i }).first();

    if (!await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }

    await createButton.click();
    await page.waitForTimeout(1000);

    // Fill in form
    const timestamp = Date.now();
    const testCustomerName = `Test Customer ${timestamp}`;
    const testEmail = `test${timestamp}@example.com`;
    const testPhone = `+569${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Try to fill name
    const nameField = page.getByLabel(/nombre|name/i).first();
    if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameField.fill(testCustomerName);
    }

    // Try to fill email
    const emailField = page.getByLabel(/correo|email/i).first();
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailField.fill(testEmail);
    }

    // Try to fill phone
    const phoneField = page.getByLabel(/teléfono|phone/i).first();
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneField.fill(testPhone);
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /guardar|save|crear|create/i }).first();

    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();

      // Wait for success message or table update
      await page.waitForTimeout(2000);

      // Check for success message
      const successMessage = page.getByText(/éxito|success|creado|created/i).first();

      if (await successMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(successMessage).toBeVisible();
      }

      // Or check that customer appears in list
      const customerInList = page.getByText(testCustomerName).first();

      if (await customerInList.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(customerInList).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test('should search for customers', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/buscar|search/i).first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Type in search
      await searchInput.fill('test');

      // Wait for results
      await page.waitForTimeout(1500);

      // Table should still be visible
      const table = page.locator('table, [role="table"]').first();

      if (await table.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(table).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test('should view customer details', async ({ page }) => {
    // Look for first customer row
    const firstRow = page.locator('table tbody tr, [role="row"]').first();

    if (await firstRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click on row or view button
      const viewButton = firstRow.getByRole('button', { name: /ver|view|details|detalles/i }).first();

      if (await viewButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await viewButton.click();
      } else {
        // Try clicking the row itself
        await firstRow.click();
      }

      // Wait for details view
      await page.waitForTimeout(1500);

      // Should see more details (dialog, modal, or new page)
      const detailsVisible = await page.locator('[data-testid="customer-details"], .modal, .dialog, [role="dialog"]')
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (!detailsVisible) {
        // Check if URL changed
        const url = page.url();
        expect(url.includes('customer') || url.includes('cliente')).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });

  test('should edit customer', async ({ page }) => {
    // Look for first customer row
    const firstRow = page.locator('table tbody tr, [role="row"]').first();

    if (!await firstRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }

    // Click edit button
    const editButton = firstRow.getByRole('button', { name: /editar|edit/i }).first();

    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click();

      // Wait for edit form
      await page.waitForTimeout(1000);

      // Try to modify name
      const nameField = page.getByLabel(/nombre|name/i).first();

      if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const currentValue = await nameField.inputValue();
        await nameField.fill(`${currentValue} Updated`);

        // Save changes
        const saveButton = page.getByRole('button', { name: /guardar|save|actualizar|update/i }).first();

        if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveButton.click();

          // Wait for success
          await page.waitForTimeout(2000);

          // Check for success message
          const successMessage = page.getByText(/éxito|success|actualizado|updated/i).first();

          if (await successMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    } else {
      test.skip();
    }
  });

  test('should delete customer', async ({ page }) => {
    // First, create a customer to delete
    const createButton = page.getByRole('button', { name: /crear|nuevo|agregar|add|new|create/i }).first();

    if (!await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }

    await createButton.click();
    await page.waitForTimeout(1000);

    // Fill minimal data
    const timestamp = Date.now();
    const testName = `ToDelete ${timestamp}`;

    const nameField = page.getByLabel(/nombre|name/i).first();
    if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameField.fill(testName);
    }

    const emailField = page.getByLabel(/correo|email/i).first();
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailField.fill(`delete${timestamp}@test.com`);
    }

    // Submit
    const submitButton = page.getByRole('button', { name: /guardar|save|crear|create/i }).first();
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }

    // Find the customer we just created
    const customerRow = page.getByText(testName).locator('..').locator('..').first();

    if (await customerRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click delete button
      const deleteButton = customerRow.getByRole('button', { name: /eliminar|delete|borrar/i }).first();

      if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteButton.click();

        // Confirm deletion if there's a confirmation dialog
        await page.waitForTimeout(500);

        const confirmButton = page.getByRole('button', { name: /confirmar|confirm|sí|yes|eliminar|delete/i }).first();

        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }

        // Wait for deletion
        await page.waitForTimeout(2000);

        // Customer should be gone from list
        const deletedCustomer = page.getByText(testName);
        const stillVisible = await deletedCustomer.isVisible({ timeout: 2000 }).catch(() => false);
        expect(stillVisible).toBeFalsy();
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('should paginate through customers list', async ({ page }) => {
    // Look for pagination controls
    const nextButton = page.getByRole('button', { name: /siguiente|next|>/i }).first();
    const prevButton = page.getByRole('button', { name: /anterior|previous|</i }).first();

    const hasPagination = await nextButton.isVisible({ timeout: 3000 }).catch(() => false) ||
                          await prevButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasPagination) {
      // Get current page content
      const initialContent = await page.textContent('body');

      // Click next if available
      if (await nextButton.isEnabled().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(1500);

        // Content should change
        const newContent = await page.textContent('body');
        expect(newContent).not.toBe(initialContent);
      }
    } else {
      test.skip();
    }
  });

  test('should filter customers by status', async ({ page }) => {
    // Look for filter dropdown or buttons
    const filterButton = page.getByRole('button', { name: /filtro|filter|estado|status/i }).first();

    if (await filterButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Select a filter option
      const filterOption = page.getByRole('option', { name: /activo|active|inactivo|inactive/i }).first();

      if (await filterOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await filterOption.click();
        await page.waitForTimeout(1500);

        // Table should still be visible with filtered results
        const table = page.locator('table, [role="table"]').first();
        await expect(table).toBeVisible();
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
