const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.findUnique({
    where: { id: 'ed102335-1481-4210-b4b9-6c02ee31fae9' }
  }).catch(() => null);

  if (!session) {
    console.log('❌ Session not found');
    process.exit(1);
  }

  // Create test emails
  const email1 = await prisma.email.create({
    data: {
      sessionId: 'ed102335-1481-4210-b4b9-6c02ee31fae9',
      subject: 'Q1 Project Update & Timeline Discussion',
      from: 'john.doe@company.com',
      body: 'Hi Team, here is the Q1 project status. Feature development is 75% complete. We need approval on scope changes by Friday. Please review the budget proposal. Schedule a call for next Tuesday or Wednesday to finalize.'
    }
  });

  const email2 = await prisma.email.create({
    data: {
      sessionId: 'ed102335-1481-4210-b4b9-6c02ee31fae9',
      subject: 'Urgent: Budget Review Needed - End of Month Deadline',
      from: 'finance@company.com',
      body: 'Please review Q1 budget allocation. We need sign-off by Friday. Action items: Review vendor contracts (finalize by month end), Approve \ tools allocation, Confirm headcount budget for new hires. Call me to discuss contingency fund.'
    }
  });

  const email3 = await prisma.email.create({
    data: {
      sessionId: 'ed102335-1481-4210-b4b9-6c02ee31fae9',
      subject: 'Candidate Interview Scheduled - Senior Developer Position',
      from: 'hr@company.com',
      body: 'We have scheduled an interview with Sarah Johnson for Senior Developer role. Interview on Tuesday Feb 25, 2PM-3PM EST via Zoom. Prepare questions on system design, leadership, and recent projects. Please confirm availability.'
    }
  });

  console.log('✅ Email 1 created: ' + email1.id);
  console.log('✅ Email 2 created: ' + email2.id);
  console.log('✅ Email 3 created: ' + email3.id);

  // Count total emails
  const count = await prisma.email.count({ where: { sessionId: 'ed102335-1481-4210-b4b9-6c02ee31fae9' } });
  console.log('Total emails in session: ' + count);
}

main().catch(console.error).finally(() => prisma.());
