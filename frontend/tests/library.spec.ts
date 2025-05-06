import { test, expect } from "@playwright/test";
import { adminApiContext } from "./helpers";

const storageStatePath = "playwright/.auth.json";
test.use({ storageState: storageStatePath });

const location = "/library";

test.describe("Add Movie Panel", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(location);
    });

    test("should have correct metadata and elements", async ({ page }) => {
        const addMovieBtn = page.getByTestId("add-movie-btn");
        await expect(addMovieBtn).toBeVisible();
        await addMovieBtn.click();
        await expect(page.getByRole("heading", { name: "Add a Movie" })).toBeVisible();
        await expect(page.getByPlaceholder("Search for a movie...")).toBeVisible();
    });

    test("should add movie successfully", async ({ page }) => {
        const testMovie = { name: "Inception", imdbId: "tt1375666" };
        const apiContext = await adminApiContext(page);

        const response = await apiContext.get(`/api/movies/imdbid/${testMovie.imdbId}`);
        expect(response.ok() || response.status() === 404).toBeTruthy();

        const id = response.ok() ? (await response.json()).id : null;
        if (id) {
            console.log(`Movie with ID ${id} already exists. Deleting it...`);
            const deleteResponse = await apiContext.delete(`/api/movies/${id}`, {
                params: { deleteFiles : true }
            });
            console.log(`Delete response: ${deleteResponse.status()}`);
            expect(deleteResponse.ok()).toBeTruthy();
        }
        await page.goto(location);

        const addMovieBtn = page.getByTestId("add-movie-btn");
        await addMovieBtn.click();
        const searchInput = page.getByPlaceholder("Search for a movie...");
        await searchInput.fill("Inception");
        await page.getByRole("button", { name: "Search" }).click();
        await expect(page.getByRole("heading", { name: "Inception" })).toBeVisible();
        await page.getByRole("button", { name: "Add" }).click();
        await expect(searchInput).not.toBeVisible();
        await expect(page.getByAltText("Inception")).toBeVisible();

        await apiContext.dispose();
    });

    test("should show movie details in popup window", async ({ page }) => {
        await expect(page.getByAltText("Inception")).toBeVisible();
        await page.getByAltText("Inception").click();
        await expect(page.getByRole("heading", { name: "Inception" })).toBeVisible();
        await expect(page.getByText("2010")).toBeVisible();
        await expect(page.getByText("Christopher Nolan").nth(0)).toBeVisible();
        await expect(page.getByText("Leonardo DiCaprio")).toBeVisible();
        await expect(page.getByText("Action, Science Fiction, Adventure")).toBeVisible();
        await expect(page.getByText("PG-13")).toBeVisible();
        await expect(page.getByText("Description")).toBeVisible();
        await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
        await page.getByRole("button", { name: "Close" }).click();
        await expect(page.getByRole("heading", { name: "Inception" })).not.toBeVisible();
    });

    test("should report an issue", async ({ page }) => {
        await expect(page.getByAltText("Inception")).toBeVisible();
        await page.getByAltText("Inception").click();
        await expect(page.getByRole("heading", { name: "Inception" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Report an issue" })).toBeVisible();
        await page.getByRole("button", { name: "Report an issue" }).click();
        await expect(page.getByRole("heading", { name: "Report an issue" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
        await expect(page.getByRole("textbox", {name: "Describe the issue..."})).toBeVisible();
        await page.getByRole("textbox", {name: "Describe the issue..."}).fill("Test issue", { force: true });
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByRole("heading", { name: "Report an issue" })).not.toBeVisible();
        await expect(page.getByRole("heading", { name: "Inception" })).toBeVisible();
        await page.getByRole("button", { name: "Close" }).click();
        await expect(page.getByRole("heading", { name: "Inception" })).not.toBeVisible();
    });
});