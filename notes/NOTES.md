## Adding a new database migration

dotnet ef migrations add [NameOfMigration] --context AppDbContext

## Drop database
dotnet ef database drop

## Export Environment Variables
export $(cat .env | xargs) && env

## Run playwright tests
npx playwright test --ui
