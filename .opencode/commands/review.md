---
description: Multi-axis code review
---
First run `bun run format`, so the review reads formatted code and never reports formatting.

Invoke the `follow-the-rules` skill to review the following aspects in the project: 
$ARGUMENTS.

Review the submited code across correctness, readability, adherence to local rules and best practices, architecture, security, and performance. 
Approve when it improves overall code health even if not perfect; flag concrete downsides otherwise.
