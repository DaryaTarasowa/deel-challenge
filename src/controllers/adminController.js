const { settings } = require('../config/settings');
const { sequelize } = require('../config/db');

async function depositTransaction(req, { depositValue, user }) {
  const { Job } = req.app.get('models');
  return sequelize.transaction(async (t) => {
    const totalDueAggregation = await Job.getUnpaidMoneyTotalForClient(user.get('id'), t);
    const totalDue = totalDueAggregation[0].total_price;

    const isAbleToDeposit = depositValue < totalDue * settings.DEPOSIT_UPPER_LIMIT;
    if (isAbleToDeposit) {
      return user.deposit(depositValue, t);
    }
    throw (new Error('Deposit value is too large'));
  });
}

async function deposit(req, { depositValue, user }) {
  const { Job } = req.app.get('models');
  const unpaidJobs = await Job.getUnpaidForUser(user.get('id'));
  const totalDue = unpaidJobs.reduce((acc, job) => acc + job.get('price'), 0);
  const isAbleToDeposit = depositValue < totalDue * settings.DEPOSIT_UPPER_LIMIT;
  if (isAbleToDeposit) {
    return user.deposit(depositValue, null);
  }
  throw (new Error('Deposit value is too large'));
}

exports.depositToUserWithLimit = async (req, res) => {
  const { Profile } = req.app.get('models');
  const { userId } = req.params;
  const depositValue = req.body?.depositValue;
  const user = await Profile.findByPk(userId);

  if (!user) {
    return res.status(400).send({ message: 'User does not exist' });
  }
  try {
    const newBalance = settings.useTransactionsForDeposit
      ? await depositTransaction(req, { depositValue, user })
      : await deposit(req, { depositValue, user });

    return res.status(200).send({ newBalance });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
};
