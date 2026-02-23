import fs from 'fs/promises';
import path from 'path';

async function main() {
  const root = path.resolve(process.cwd(), 'data', 'secret-agents-pilot');
  const pkgDir = path.join(root, 'leadership-packages', `${new Date().toISOString().replace(/[:.]/g, '-')}_demo-seeded`);
  await fs.mkdir(pkgDir, { recursive: true });

  await fs.writeFile(path.join(root, 'solution-bom.csv'),
    'solutionId,name,type,partnerName,industries,targetRoles,gaStatus,elevatorPitch,updatedAt\n' +
    'sol_finance,Finance Copilot Agent,agent,Contoso,Financial Services,CFO|Finance Director,GA,"Automates close analysis",'+new Date().toISOString()+'\n',
    'utf8'
  );

  await fs.writeFile(path.join(root, 'pilot-data.json'), JSON.stringify({
    metadata: { pilotName: 'Secret Agents Co-Sell Pilot', region: 'US Enterprise', updatedAt: new Date().toISOString() },
    solutions: [{ solutionId: 'sol_finance', name: 'Finance Copilot Agent' }],
    sellers: [{ sellerEmail: 'seller@company.com', status: 'active' }],
    promotions: [{ accountName: 'Fabrikam', outcome: 'poc' }]
  }, null, 2), 'utf8');

  await fs.writeFile(path.join(pkgDir, 'leadership-summary.md'),
`# Secret Agents Pilot Summary

- Solutions inventoried: 1
- Sellers active: 1
- Promotions logged: 1
- Draft-only mode enabled
`, 'utf8');

  await fs.writeFile(path.join(pkgDir, 'kpi-snapshot.csv'),
    'generatedAt,solutionsInventoried,sellersActive,promotionsLogged\n' +
    `${new Date().toISOString()},1,1,1\n`, 'utf8');

  await fs.writeFile(path.join(pkgDir, 'promotions-detail.csv'),
    'accountName,outcome\nFabrikam,poc\n', 'utf8');

  await fs.writeFile(path.join(pkgDir, 'feedback-detail.csv'),
    'actorType,phase,qualitativeFeedback\nseller,post,Need compensation clarity\n', 'utf8');

  await fs.writeFile(path.join(pkgDir, 'risks-detail.csv'),
    'title,severity,status\nLow partner response,high,open\n', 'utf8');

  await fs.writeFile(path.join(pkgDir, 'pilot-data-snapshot.json'),
    await fs.readFile(path.join(root, 'pilot-data.json'), 'utf8'), 'utf8');

  console.log('Demo package created at:');
  console.log(pkgDir);
}
main().catch(e => { console.error(e); process.exit(1); });
