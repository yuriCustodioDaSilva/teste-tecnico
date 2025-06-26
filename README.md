# teste-tecnico

<!-- Rodar frontned -->
npm start

<!-- Rodar backend -->
dotnet watch run

importante lembrar de parar o backend antes de criar migrations e principalmente executar

<!-- criar migrations -->
dotnet ef migrations add TblAtentimento

<!-- Executar migrations -->
dotnet ef database update
