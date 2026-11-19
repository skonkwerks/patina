import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import { Pagination } from '../../composites/pagination/index.js';
import { Button } from '../button/index.js';
import { TextField } from '../textfield/index.js';
import { I18nProvider } from './index.js';

const meta = {
  title: 'Aria/I18nProvider',
  component: I18nProvider,
} satisfies Meta<typeof I18nProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** German words for the pagination, as an app in German gives them. */
const german = {
  pagination: {
    previousLabel: 'Vorherige Seite',
    nextLabel: 'Nächste Seite',
    pageLabel: (page: number) => `Seite ${page}`,
  },
};

/** Without a provider, Patina's English. */
export const English: Story = {
  args: { children: <Pagination aria-label='Invoice pages' pageCount={3} /> },
  // The pagination alone, with no provider around it.
  render: ({ children }) => <div>{children}</div>,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Next page' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Page 2' }),
    ).toBeInTheDocument();
  },
};

/**
 * An app in German gives its words once, at its root, and every component under it shows them. A
 * component's own prop still wins for that use.
 */
export const AppWords: Story = {
  args: {
    locale: 'de-DE',
    messages: german,
    children: (
      <div className='flex flex-col gap-4'>
        <Pagination aria-label='Rechnungsseiten' pageCount={3} />
        <Pagination
          aria-label='Kundenseiten'
          pageCount={3}
          nextLabel='Weiter'
        />
      </div>
    ),
  },
  play: async ({ canvas }) => {
    const invoices = within(
      canvas.getByRole('list', { name: 'Rechnungsseiten' }),
    );
    await expect(
      invoices.getByRole('button', { name: 'Nächste Seite' }),
    ).toBeInTheDocument();
    await expect(
      invoices.getByRole('button', { name: 'Seite 2' }),
    ).toBeInTheDocument();
    const customers = within(
      canvas.getByRole('list', { name: 'Kundenseiten' }),
    );
    await expect(
      customers.getByRole('button', { name: 'Weiter' }),
    ).toBeInTheDocument();
    await expect(
      customers.getByRole('button', { name: 'Vorherige Seite' }),
    ).toBeInTheDocument();
  },
};

/**
 * A provider inside another changes only what it is given. The inner one here gives one word: the
 * rest of the words stay the outer one's, and so does its locale, Egyptian Arabic, whose page
 * numbers are written in Arabic-Indic digits.
 */
export const Nested: Story = {
  args: {
    locale: 'ar-EG',
    messages: german,
    children: (
      <I18nProvider messages={{ pagination: { nextLabel: 'Weiter' } }}>
        <Pagination aria-label='Rechnungsseiten' pageCount={3} />
      </I18nProvider>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Weiter' }),
    ).toBeInTheDocument();
    const second = canvas.getByRole('button', { name: 'Seite 2' });
    await expect(second).toHaveTextContent('٢');
    await expect(
      canvas.getByRole('button', { name: 'Vorherige Seite' }),
    ).toBeInTheDocument();
  },
};

/** An app that lets the person go between the browser's language and Egyptian Arabic. */
const LanguageChoice = () => {
  const [locale, setLocale] = useState<string>();
  return (
    <div className='flex flex-col items-start gap-4'>
      <Button
        onPress={() => setLocale(locale === undefined ? 'ar-EG' : undefined)}
      >
        {locale === undefined ? 'Use Arabic' : "Use the browser's language"}
      </Button>
      <I18nProvider locale={locale}>
        <TextField label='Note' />
        <Pagination aria-label='Invoice pages' pageCount={3} />
      </I18nProvider>
    </div>
  );
};

/**
 * Going between the browser's language and a chosen one changes the locale of everything under
 * the provider, and nothing else: the field the person was typing in stays the same field, with
 * its text.
 */
export const SwitchingLanguage: Story = {
  args: { children: null },
  render: () => <LanguageChoice />,
  play: async ({ canvas, userEvent }) => {
    const note = canvas.getByRole('textbox', { name: 'Note' });
    await userEvent.type(note, 'Call back on Monday');
    await expect(
      canvas.getByRole('button', { name: 'Page 2' }),
    ).toHaveTextContent('2');

    await userEvent.click(canvas.getByRole('button', { name: 'Use Arabic' }));
    await expect(
      canvas.getByRole('button', { name: 'Page 2' }),
    ).toHaveTextContent('٢');
    await expect(canvas.getByRole('textbox', { name: 'Note' })).toBe(note);
    await expect(note).toHaveValue('Call back on Monday');

    await userEvent.click(
      canvas.getByRole('button', { name: "Use the browser's language" }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Page 2' }),
    ).toHaveTextContent('2');
    await expect(canvas.getByRole('textbox', { name: 'Note' })).toBe(note);
  },
};
