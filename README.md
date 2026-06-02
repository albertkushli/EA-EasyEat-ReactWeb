# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# MINIM2 - Frontend sistema de denúncies de restaurants

## Descripció

S’ha implementat la part de frontend React del sistema de denúncies de restaurants.

Aquesta funcionalitat permet que un usuari pugui denunciar un restaurant des de la vista de detall del restaurant, escrivint un motiu en format text lliure.

## Estat de l’exercici

La part frontend està implementada.

## Parts operatives

- Botó `Denunciar restaurant` dins del perfil del restaurant.
- Modal/formulari per escriure el motiu de la denúncia.
- Validació del text introduït per l’usuari.
- Connexió amb el backend mitjançant el servei de reports.
- Enviament de denúncies al backend.
- Missatge d’èxit o error després d’enviar la denúncia.
- CSS adaptat a l’estil visual del projecte.

## Parts NO operatives
Fins última hora no m'he adonat que estaba treballant des del main i no desdel entorn de producció del develop.
Ho cambiaré per la presentació final el merge
## Endpoint utilitzat

```http
POST /restaurants/:restaurantId/report