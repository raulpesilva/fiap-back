import cors from '@fastify/cors';
import { FastifyPluginCallback } from 'fastify';
import { multiTenantDB } from 'src/db';
import { formatBRLCurrencyDisplay } from 'src/utils/formatCurrency';
import { PubSub } from 'src/utils/pubsub';

type InterServerEvents = {
  'transaction:event': (farmId: number) => void;
  'notification:new': (content: { farm_id: number; title: string; message: string; type: string }) => void;
};
export const pubSub = new PubSub<InterServerEvents>();

export const eventsPlugin: FastifyPluginCallback = (server, _options, done) => {
    server.register(cors, { origin: '*' });
  
  pubSub.subscribe('transaction:event', (farmId) => {
    server.log.info({ 'transaction:event': farmId });
    const goalsTable = multiTenantDB.getInstance(farmId).getTable('goals');
    const goals = goalsTable.find((g) => !g.completed);
    server.log.info({ 'transaction:event': farmId, goals, allGoals: goalsTable.getAll() });
    if (goals.length === 0) return;
    const transactions = multiTenantDB
      .getInstance(farmId)
      .getTable('transactions')
      .find((t) => goals.some((g) => g.product_id === t.product_id));

    if (transactions.length === 0) return;

    const completedGoals = goals.map((goal) => {
      const date = new Date(goal.created_at);
      const inRangeTransactions = transactions.filter((transaction) => {
        if (transaction.product_id !== goal.product_id) return false;
        if (new Date(transaction.date) <= date) return false;
        if (transaction.type !== goal.type) return false;
        return true;
      });
      const value = inRangeTransactions.reduce((acc, t) => {
        if (t.type === 'sale' && goal.measure === 'price') return acc + t.total_price;
        return acc + t.quantity;
      }, 0);
      return {
        ...goal,
        value,
        completed: value >= goal.target ? new Date().toISOString() : undefined,
      };
    });

    completedGoals.forEach((goal) => {
      if (!goal.completed) return goalsTable.update((g) => g.id === goal.id, goal);
      const formattedTarget = goal.measure === 'price' ? `${formatBRLCurrencyDisplay(goal.target)}` : goal.target;
      pubSub.publish('notification:new', {
        farm_id: farmId,
        title: `Goal "${goal.name}" completed!`,
        message: `Congratulations! The goal "${goal.name}" has reached its target ${goal.measure} ${formattedTarget}.`,
        type: goal.type,
      });

      goalsTable.update((g) => g.id === goal.id, { ...goal, notified: new Date().toISOString() });
    });
    server.io.to(`farm_${farmId}`).emit('goal:updated');
    server.log.info({ completedGoals });
  });

  done();
};
