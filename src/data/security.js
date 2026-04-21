export const security = {
  intro: `Notes and reflections from my ongoing journey to secure my right to privacy on the internet. Follow along with my blog style narrative as I divulge what I'm doing to be safer and more secure online.`,
  posts: [
    {
      slug: 'a-pihole-with-a-forward-proxy',
      date: '2026-04-01',
      keywords: ['pi-hole', 'dns', 'home-network'],
      title: 'A Pi-Hole with a forward proxy',
      body: [
        `This is my favorite project I've ever worked on, it's featured on the front of my website and for good reason. Typically, you would setup a Pi-Hole on a raspberry-pi, but I already had a thinkpad I had purchased the previous summer laying around so I opted to use that instead. On my router at home, where I could actually control it, I hooked up the thinkpad and began working on installing a pi-hole and a forward proxy using Wireguard and Docker. The result is network wide DNS level ad blocking and a forward proxy layer that adds an extra degree of privacy and security across all the devices on the network.`,
      ],
    },
    {
      slug: 'ditching-my-iphone',
      date: '2026-03-14',
      keywords: ['iphone', 'grapheneos', 'mobile'],
      title: 'Ditching my iPhone',
      body: [
        `This next project took the farthest by long and was the most difficult to pull off, I finally got rid of my iPhone. iPhone has always made the experience of texting non-iPhone users worse on purpose as a way to keep you on iPhone - which I had a fundamental disagreement with, I didn't want to be locked into always paying Apple thousands of dollars every few years. So I set off and did days of research on what else I could possible do, and that's when I found GrapheneOS. I had had no experience with mobile devices beyond an iPhone so I didn't know what to do, but I found a solution where I purchased a Google Pixel, and installed a custom operating system on it. GrapheneOS is a privacy focused OS and gives you the option to place apps that are known data stealers into a privacy section, where they are unable to interact with any of the other apps on your phone.`,
        `This project taught me so much and I'm still learning from it, I feel safer knowing that my phone isn't tracking my location and as an extra precaution I haven't turned on location services on since I first booted the phone up. Unfortunately there are some cons with this project, the big one is that groupchats with iPhone users is still not working well and I'm still in the process of debugging what the root issue is. Hopefully though I'll be able to figure it out, but besides that I'm very content with my new phone!`,
      ],
    },
    {
      slug: 'the-migration-to-linux',
      date: '2026-02-27',
      keywords: ['linux', 'desktop', 'migration'],
      title: 'The migration to Linux',
      body: [
        `It was finally time to switch to Linux. I had known that Windows and Mac were unsecure for the longest time, but switching always felt like far too much work for what you got out of it, I couldn't have been more wrong. First, I used my laptop as a test run to see if I could do it before I moved onto my desktop. I opted to go with Arch since, after researching, it was my opinion that if I was going to do this, I had to do it from the more barebones operating system. After spending many days setting it up and tweaking it, I finally had Arch running on my laptop with Hyprland as the desktop environment, you can view my dotfiles for my setup on my GitHub.`,
        `Next up was the desktop, I didn't want to go through the pain of setting Arch up again since I had already done it, so I opted for Linux Mint. Setting this up was far easier since it comes preinstalled with everything I needed. Of all the changes I've made in this journey with their pros and cons, this one has had zero cons. Linux is far superior in every aspect and it's a shame that so few people use it for their everyday operating system. I'm immensely happy that I've made the switch and can rest easy knowing that Windows isn't harvesting my telemetry to use for AI training or for advertisers.`,
      ],
    },
    {
      slug: 'picking-a-password-manager',
      date: '2026-02-09',
      keywords: ['passwords', 'bitwarden', 'security'],
      title: 'Picking a password manager',
      body: [
        `Picking a password manager was something that I didn't even realize I needed to do, I thought with my new Firefox account I was secure in every way. However, I soon realized that storing passwords in a web browser risks all kinds of attacks from malicious users. Eventually I'll switch over to an open sourced, locally hosted, docker based password manager, but for now since I'm on my school's WiFi, I opted for Bitwarden. Switching was very easy, exporting passwords from Firefox as a csv file and importing them into Bitwarden made things very smooth. I was able to download Bitwarden on all my devices and now I get my password manager everywhere.`,
      ],
    },
    {
      slug: 'proton-email-a-vpn',
      date: '2026-02-01',
      keywords: ['proton', 'email', 'vpn'],
      title: 'Proton Email + A VPN',
      body: [
        `Switching email's can be one of the hardest things to do, since email accounts you have are often registered with numerous sites, some you may have forgotten about. I decided I didn't care if I lost some accounts and finally decided to switch to a more secure email, additionally it was finally time to start using a VPN. I spent a few days deleting old gmail and other email accounts that I no longer used - as organization is just as important to me as online privacy. Once I was done to one gmail account and one iCloud account that for now I can't get rid of, it was time to sign up for a more secure email. After some research, Proton stood out to me as the safest choice, I could also use the same account to sign up for a VPN.`,
        `In addition to a more secure email I began setting up my VPN, with a free account I was only able to set it up on one device, so I opted for using my phone since I travel with it everywhere, and by routing the traffic it would be less likely for search indexes to pinpoint me.`,
      ],
    },
    {
      slug: 'no-more-google',
      date: '2026-01-23',
      keywords: ['google', 'browser', 'search'],
      title: 'No more Google',
      body: [
        `One of the easiest first steps that I knew to take was to follow my brothers advice and switch off of Google Chrome. It was certainly annoying, having used Chrome for years and years, I had all my passwords and accounts saved there, so the switch wasn't fun. I did research on the best browsers and came down to Firefox and Brave, I know Brave is the gold standard for privacy but after reading that many sites just don't work on Brave I opted for the more accessible browser and chose Firefox. It took me just a few days to set up accounts on all my devices, import passwords (which I'd soon remove from browsers entirely), bookmars, and other small things.`,
        `That wasn't it though, Firefox alone wasn't going to meet the standards that I wanted so I had to take it a step further. I installed U-Block origin, switched to Duckduckgo as a search engine, and loaded in a user.js profile called Arkenfox. After all that I finally felt more secure while on the internet, knowing that my searches weren't being catalogged and AI wasn't training on my data.`,
      ],
    },
    {
      slug: 'the-wake-up',
      date: '2026-01-05',
      keywords: ['motivation', 'threat-model', 'why'],
      title: 'The wake-up call',
      body: [
        `This is the first entry in my blog posts about what led me onto the journey I am on now. Sometime after new years, for almost no reason, I had the strongest sensation that I hated having Google Chrome logging my searches, I didn't like how I knew Windows 11 was using my data to train their AI models, and I especially didn't like my iPhone tracking every step I took. For no reason in particular, I set off on a journey to protect my telemetry, my info, and my rights on the internet. Follow me through my journey as I prevent corporations from tracking me.`,
      ],
    },
  ],
}
