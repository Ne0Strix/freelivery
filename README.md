# Development Setup

- open the project using the `freelivery.workspace` file
- install the recommended extensions
- run `npm i` in the project root, the `postinstall` will take care of the nested folders
- set the environment variables as you need in the `.env`
- start everything you need using the `Full Stack: …` Run and Debug Configuration
- **start developing**, all your breakpoints should work, so it's just the bugs waiting to be caught …!

> [!NOTE]
> To clear the database and re-run migrations use `docker compose down -v`.

## Split of Work

| Topic            | Responsible Person |
| :--------------- | :----------------- |
| Site Manager     | Armin              |
| Restaurant Owner | Katharina          |
| Customer (User)  | Miriam             |

## General Notes

### Backend Architecture

> [!NOTE]
> Please check the implementation of the address endpoint. It works as intended
> and is meant to be a basic proof-of-concept to show the basic structure of the backend.

- `abstract-repository.ts`
    - provides db-connection and basic crud functionality.
- `<entity>.repository.ts`
    - provides a `<entity>Row` interface which exactly mirrors the relating db-table
    - implements the create/update methods
- `<entity>.service.ts`
    - uses repository for crud-actions
    - defines the dto `<entity>`
    - is the only class that exposes repository methods to the public

Backend routes are mirrored by their corresponding services:

| Backend Route   | Frontend Service       |
| :-------------- | :--------------------- |
| `/customer/…`   | `CustomerService.ts`   |
| `/restaurant/…` | `RestaurantService.ts` |
