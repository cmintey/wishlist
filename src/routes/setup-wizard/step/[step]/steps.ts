import type { Component } from "svelte";
import CreateAccountStep from "./CreateAccountStep.svelte";
import GlobalSettingsStep from "./GlobalSettingsStep.svelte";
import InviteUsersStep from "./InviteUsersStep.svelte";

export const steps: Component[] = [CreateAccountStep, GlobalSettingsStep, InviteUsersStep];
