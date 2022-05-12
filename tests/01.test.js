const fn = mock.fn(() => 2)
expect(fn).toHaveBeenCalled()
expect(1).toBe(2);
