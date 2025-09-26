'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavigationItem {
  name: string
  href: string
  current?: boolean
}

interface HeaderProps {
  navigation?: NavigationItem[]
  className?: string
}

const defaultNavigation: NavigationItem[] = [
  { name: 'Features', href: '/#features' },
  { name: 'Privacy', href: '/#privacy' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export function Header({
  navigation = defaultNavigation,
  className,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className={cn(
        'bg-parchment-white border-b border-border-gray',
        className
      )}
    >
      <nav
        className="mx-auto max-w-7xl px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Silent Scribe</span>
              <div className="flex items-center space-x-3">
                <Image
                  src="/silent-scribe-logo.svg"
                  alt="Silent Scribe Logo"
                  width={80}
                  height={80}
                  className="h-20 w-20"
                />
                <span className="text-h3 font-medium text-ink-black">
                  Silent Scribe
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-text-gray"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn('text-ui-label font-medium transition-colors', {
                  'text-quill-blue': item.current,
                  'text-text-gray hover:text-quill-blue': !item.current,
                })}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
            <Link href="/beta">
              <Button variant="ghost" size="sm">
                Join Beta
              </Button>
            </Link>
            <Link href="/beta">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-parchment-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border-gray">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="-m-1.5 p-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Silent Scribe</span>
              <div className="flex items-center space-x-3">
                <Image
                  src="/silent-scribe-logo.svg"
                  alt="Silent Scribe Logo"
                  width={80}
                  height={80}
                  className="h-20 w-20"
                />
                <span className="text-h3 font-medium text-ink-black">
                  Silent Scribe
                </span>
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-text-gray"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border-gray">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      '-mx-3 block rounded-lg px-3 py-2 text-body font-medium transition-colors',
                      {
                        'text-quill-blue bg-blue-50': item.current,
                        'text-text-gray hover:bg-document-gray': !item.current,
                      }
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6 space-y-2">
                <Link
                  href="/beta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-body font-medium text-text-gray hover:bg-document-gray"
                >
                  Join Beta
                </Link>
                <Link
                  href="/beta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-body font-medium bg-quill-blue text-parchment-white hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
