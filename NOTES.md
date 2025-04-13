

## Generate a new controller

dotnet-aspnet-codegenerator controller -name MoviesController -async -api -m Movie -dc AppDbContext --relativeFolderPath Controllers


## Add a new database migration

dotnet ef migrations add [NameOfMigration] --context AppDbContext
dotnet ef migrations add [NameOfMigration] --context UserDbContext


## Update database from migration

dotnet ef database update --context AppDbContext
dotnet ef database update --context UserDbContext


### KNOWN BUGS

Search
    - Invalid search does not display error message
    - Add title button flashes loading on click due to slow check animation
    - add title button doesnt reset on new search
    - search error (the simple plan) does nothing

Queue
    - Unable to Load Queue message displays in black text

### TODO
- update the landing page to display a blockbuster like shelf