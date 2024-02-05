# SQLMAP DEMO

the purpose of this project is to figure out whether `sqlmap` can find SQL injection vulerability of APIs that are desinged in a proper way. The proper way means an API checks the types of parameters and use them in query using `?` notation.

For Example

```sql
conn.query(
  `SELECT id, content, done FROM todo WHERE user_id = ? and id = ?`,
  [userId, id]
)
```

As the result, `sqlmap` didn't find any vulnerabilities, if you wanna see the code, you can find the code in the `server` directory of this repostitory.

---

To test `sqlmap` works correctly, some APIs are implemented having vulnerabilities that don't check the types of parameters and make sql query using string concatenation.

`sqlmap` succesfully found the vulnerabilities and showed the information was queried.

You can see it yourself by using `docker-compose.yml` in the sqlmap directory.

Under the sqlmap directory, run this command:

```properties
docker compose up --build ----abort-on-container-exit
```

It will show the database version, databases and tables. As it runs in github actions when pusing the code to the `main` branch, you can find the result in the Github action tab of this repository.
