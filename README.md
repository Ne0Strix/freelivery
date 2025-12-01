# Development Setup

- open the project using the `freelivery.workspace` file
- install the recommended extensions
- run `npm i` in the project root, the `postinstall` will take care of the nested folders
- set the environment variables as you need in the `.env`
- start everything you need using the `Full Stack: …` Run and Debug Configuration
- **start developing**, all your breakpoints should work, so it's just the bugs waiting to be caught …!

## Split of Work

| Topic            | Responsible Person |
| :--------------- | :----------------- |
| Site Manager     | Armin              |
| Restaurant Owner | Katharina          |
| Customer (User)  | Miriam             |

## General Notes

### Backend Architecture

Backend routes are mirrored by their corresponding services:

| Backend Route   | Frontend Service       |
| :-------------- | :--------------------- |
| `/customer/…`   | `CustomerService.ts`   |
| `/restaurant/…` | `RestaurantService.ts` |
