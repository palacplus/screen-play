

## Generate a new controller

dotnet-aspnet-codegenerator controller -name MoviesController -async -api -m Movie -dc AppDbContext --relativeFolderPath Controllers


## Add a new database migration

dotnet ef migrations add [NameOfMigration] --context AppDbContext
dotnet ef migrations add [NameOfMigration] --context UserDbContext


## Update database from migration

dotnet ef database update --context AppDbContext
dotnet ef database update --context UserDbContext

## Export Environment Variables
export $(cat .env | xargs) && env

## Run playwright tests
npx playwright test --ui
