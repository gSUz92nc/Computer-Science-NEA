<script lang="ts">
  export let data
  const { supabase } = data

  let email = ''
  let password = ''
  let loading = false

  async function login() {
    try {
      loading = true
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
      } else {
        window.location.href = '/'
      }
    } finally {
      loading = false
    }
  }

  async function signUp() {
    try {
      loading = true
      const { error } = await supabase.auth.signUp({ email, password })

      if (error) {
        alert(error.message)
      } else {
        alert('Account created successfully! You can now login.')
      }
    } finally {
      loading = false
    }
  }
</script>

<div class="w-full">
  <div class="hero-content lg:flex-row-reverse">
    <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-200">
      <form class="card-body">
        <div class="form-control">
          <label class="label" for="email-input">
            <span class="label-text font-bold text-lg">Email</span>
          </label>
          <input name="email" type="email" class="input" bind:value={email} />
        </div>
        <div class="form-control">
          <label class="label" for="password-input">
            <span class="label-text font-bold text-lg">Password</span>
          </label>
          <input
            name="password"
            type="password"
            class="input bg-base-300"
            bind:value={password}
          />
          <label
            class="label"
            for="Forgot password and have an account buttons"
          >
            <a
              href="/auth/forgot-password"
              class="label-text-alt link link-hover">Forgot password?</a
            >
          </label>
        </div>
        <div class="form-control">
          <button class="btn btn-neutral" on:click={login}>Login</button>
          <button class="btn mt-2 btn-neutral" on:click={signUp}>Sign up</button
          >
        </div>
      </form>
    </div>
  </div>
</div>
