import i18n from '#/i18n';
import { useToastStore } from '#/store/toastStore';
import { queryClient } from '../queryClient';

describe('queryClient', () => {
  beforeEach(() => {
    useToastStore.setState({ message: null });
  });

  afterEach(() => {
    // Queries scheduled a real gcTime cleanup timer on the shared client;
    // clear() cancels it so Jest can exit without --forceExit.
    queryClient.clear();
  });

  it('shows a toast when a query fails', async () => {
    await queryClient
      .fetchQuery({
        queryKey: ['test-failing-query'],
        queryFn: () => Promise.reject(new Error('network failure')),
        retry: false,
      })
      .catch(() => {});

    expect(useToastStore.getState().message).toBe(i18n.t('errors.dataFailed'));
  });

  it('does not show a toast when a query succeeds', async () => {
    await queryClient.fetchQuery({
      queryKey: ['test-succeeding-query'],
      queryFn: () => Promise.resolve('ok'),
    });

    expect(useToastStore.getState().message).toBeNull();
  });
});
