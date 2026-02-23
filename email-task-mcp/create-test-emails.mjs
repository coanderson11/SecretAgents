import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sessionId = 'ed102335-1481-4210-b4b9-6c02ee31fae9';

async function main() {
  try {
    // Check if session exists
    let session = await prisma.session.findUnique({ where: { id: sessionId } });
    
    if (!session) {
      console.log('Creating new session...');
      session = await prisma.session.create({ data: {} });
      console.log(`✅ Session created: ${session.id}`);
    } else {
      console.log(`✅ Using existing session: ${sessionId}`);
    }

    // Clear old test data
    const deleted = await prisma.email.deleteMany({ where: { sessionId } });
    console.log(`Cleared ${deleted.count} existing emails`);

    // Create test emails
    const email1 = await prisma.email.create({
      data: {
        sessionId,
        subject: 'Q1 Project Update & Timeline Discussion',
        from: 'john.doe@company.com',
        body: 'Hi Team, here is the Q1 project status. Feature development is 75% complete. We need approval on scope changes by Friday. Please review the attached budget proposal. Schedule a call for next Tuesday or Wednesday to finalize the details. This is urgent!'
      }
    });

    const email2 = await prisma.email.create({
      data: {
        sessionId,
        subject: 'Urgent: Budget Review Needed - End of Month Deadline',
        from: 'finance@company.com',
        body: 'Please review the Q1 budget allocation. We need your sign-off by Friday, February 21st. Action items: 1) Review vendor contracts and finalize by month end, 2) Approve the proposed $50K allocation for tools, 3) Confirm headcount budget for new hires. Call me to discuss the contingency fund. Very time sensitive!'
      }
    });

    const email3 = await prisma.email.create({
      data: {
        sessionId,
        subject: 'Candidate Interview Scheduled - Senior Developer Position',
        from: 'hr@company.com',
        body: 'We have scheduled an interview with Sarah Johnson for the Senior Developer role. Interview Details: Date: Tuesday, February 25th, 2026, Time: 2:00 PM - 3:00 PM EST, Location: Zoom (link will be sent separately), Interviewers: You, Tech Lead, and Manager. Please prepare questions focused on: 1) System design experience, 2) Leadership and mentoring, 3) Recent project contributions. Confirm your availability ASAP.'
      }
    });

    console.log(`✅ Email 1 created: ${email1.id}`);
    console.log(`✅ Email 2 created: ${email2.id}`);
    console.log(`✅ Email 3 created: ${email3.id}`);

    const count = await prisma.email.count({ where: { sessionId } });
    console.log(`✅ Total emails: ${count}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
