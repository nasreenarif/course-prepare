MODULE 4 PRACTICE EXAMPLES

Run these commands from task-app (the folder containing server and client).
These scripts require Node.js but do not connect to MongoDB or create accounts.

node practice/permission-demo.mjs
Expected: guest false, owner true, other account false.
This is a policy reasoning model. Production identity must come from the server.

node practice/password-demo.mjs
Expected: different stored values true, correct password true, wrong password false.
This imports the actual server password helper. Allow several seconds for hashing.
It prints no password hashes and writes no files.

node practice/array-updates.mjs
Expected: original unchanged true, updated complete true, new array true, deletion 0.
The transformations match the React map/filter examples in lesson 4.12.

node --test practice/practice.test.mjs
Checks valid and invalid priority values for the optional extension helper.

priority.mjs is an optional helper, NOT an enabled field in the main app.
Lesson 4.14 gives the complete coordinated schema, validation, projection,
form, submission, and display edits. Perform them in a copy of the companion,
then test the actual API and UI. A helper test does not validate those edits.

Complete running application: see ../README.txt.
